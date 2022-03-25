import { BlockchainService } from '@lib/blockchain';
import { MathHelper } from '@lib/helper';
import { AppError } from '@lib/helper/errors/base.error';
import { BoxCampaignRound, PrismaService } from '@lib/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  BoxCampaign,
  BoxCampaignBuyHistory,
  BoxCampaignSubscribes,
  BoxContract,
  BoxPrice,
  BoxType,
  Chain,
  ChainSymbol,
  Currency,
  User,
} from '@prisma/client';
import { Cache } from 'cache-manager';
import { GBoxPriceHistory } from '../box-campaign/dto/box-campaign.dto';
import { EmailService } from '../email/email.service';
import { EmailType } from '../email/email.type';

interface UpdateData {
  subject: BoxCampaignBuyHistory;
  tx_hash?: string;
  reason?: string; // if error
}
const EVERY_2_MINUTES = '0 */2 * * * *';
const EVERY_1_MINUTES = '0 */1 * * * *';
// time
const ONE_DAY: number = 86400000;
const FIFTEEN_MINUTES: number = 900000;
// check email sent only once
const checkUser = new Map<number, boolean>();
const checkEmailType = new Map<EmailType, boolean>();
@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private prisma: PrismaService,
    private bcService: BlockchainService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private emailService: EmailService,
  ) {}

  @Cron(EVERY_2_MINUTES)
  async handlePendingBuyBox() {
    // get list pending
    const _buyHistories = await this.prisma.boxCampaignBuyHistory.findMany({
      where: { status: 'PENDING' },
    });
    // console.log('_buyHistories: ', _buyHistories);
    if (!_buyHistories || _buyHistories.length == 0) {
      this.logger.debug('PENDING HISTORY EMPTY');
      return;
    }

    // update state to processing to void duplicate check by other worker
    await this.prisma.boxCampaignBuyHistory.updateMany({
      where: {
        id: {
          in: _buyHistories.map((item) => item.id),
        },
      },
      data: {
        status: 'PROCESSING',
      },
    });

    // Cache box info
    const qData = await Promise.all([
      this.prisma.boxPrice.findMany({
        where: {
          uid: {
            in: _buyHistories.map((item) => item.box_price_uid),
          },
        },
        include: {
          boxType: {
            include: {
              campaign: true,
            },
          },
          // chain: true,
          currency: {
            include: {
              chain: true,
            },
          },
          contract: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          id: {
            in: _buyHistories.map((item) => item.user_id),
          },
        },
      }),
    ]);
    // console.log('qData: ', qData);

    const _boxPrices: {
      [key: string]: BoxPrice & {
        boxType: BoxType & {
          campaign: BoxCampaign;
        };
        // chain: Chain;
        currency: Currency & { chain: Chain };
        contract: BoxContract;
      };
    } = {};
    for (const item of qData[0]) {
      _boxPrices[item.uid] = item;
    }

    // const _boxContracts: { [key: string]: BoxContract } = {};
    // for (const item of qData[1]) {
    //   const key = (
    //     item.box_campaign_uid +
    //     item.chain_symbol +
    //     item.currency_symbol
    //   ).toLowerCase();
    //   _boxContracts[key] = item;
    // }
    // console.log('_boxContracts: ', _boxContracts);

    const _users: { [key: string]: User } = {};
    for (const item of qData[1]) {
      _users[item.id] = item;
    }

    const listFailed: UpdateData[] = [];
    const listConfirming: UpdateData[] = [];

    // loop and check
    for (const buyHistory of _buyHistories) {
      const boxPrice = _boxPrices[buyHistory.box_price_uid];
      if (!boxPrice) {
        const reason = 'Box price not found';
        this.logger.error(reason);
        listFailed.push({ reason, subject: buyHistory });
        continue;
      }

      const user = _users[buyHistory.user_id];
      if (!user) {
        const reason = 'User not found';
        this.logger.error(reason);
        listFailed.push({ reason, subject: buyHistory });
        continue;
      }

      try {
        const result: any = await this.bcService.buyBox(
          user.address,
          buyHistory.quantity,
          boxPrice,
        );
        if (!result || !result.hash) {
          listFailed.push({
            reason: 'Buybox hash not found',
            subject: buyHistory,
          });
        } else {
          listConfirming.push({
            tx_hash: result.hash,
            reason: 'Update comfirming status failed',
            subject: buyHistory,
          });
        }
      } catch (err) {
        this.logger.error(err);
        listFailed.push({
          reason: 'Call contract buybox failed: ' + err.toString(),
          subject: buyHistory,
        });
      }
    }

    try {
      if (listConfirming.length > 0) {
        await this.prisma.$transaction(
          listConfirming.map((item) =>
            this.prisma.boxCampaignBuyHistory.update({
              where: {
                id: item.subject.id,
              },
              data: {
                status: 'CONFIRMING',
                tx_hash: item.tx_hash,
              },
            }),
          ),
        );
      }
    } catch (err) {
      listFailed.concat(listConfirming);
    } finally {
      if (listFailed.length == 0) {
        return;
      }
      console.log('listFailed: ', listFailed);
      await this.prisma.$transaction(
        listFailed.map((item) =>
          this.prisma.boxCampaignBuyHistory.update({
            where: {
              id: item.subject.id,
            },
            data: {
              status: 'FAILED',
              data: item.reason,
            },
          }),
        ),
      );
      // update sold amount of box type when buy failed
      await this._updateSoldAmountWhenBuyFailed(
        listFailed.map((item) => item.subject),
      );
    }
  }

  @Cron(EVERY_2_MINUTES)
  async handleConfirmingBuyBox() {
    try {
      // get list CONFIRMING
      const confirmingItems = await this.prisma.boxCampaignBuyHistory.findMany({
        where: { status: 'CONFIRMING' },
      });
      if (!confirmingItems || confirmingItems.length === 0) {
        this.logger.debug('CONFIRMING Box EMPTY');
        return;
      }

      const listSucceed: number[] = [];
      const listFailed: BoxCampaignBuyHistory[] = [];
      // loop and check
      for (const item of confirmingItems) {
        // check min time confirming is 30s before check confirmed
        if (new Date().getTime() - item.updated_at.getTime() < 30000) {
          this.logger.debug('Ignore by short time');
          continue;
        }
        // check confirmed
        const boxPrice: GBoxPriceHistory = item.box_price as any;
        if (!boxPrice || !boxPrice.uid) {
          this.logger.error('BoxPrice in history empty');
          continue;
        }

        try {
          const result: any = await this.bcService.getTransaction(
            item.tx_hash,
            boxPrice.chain_symbol,
          );
          // console.log('result: ', result);
          if (!!result) {
            if (result.status === 1) {
              listSucceed.push(item.id);
            } else {
              listFailed.push(item);
            }
          }
        } catch (err) {
          this.logger.error(err);
        }
      }

      // update state
      if (listSucceed.length > 0) {
        await this.prisma.boxCampaignBuyHistory.updateMany({
          where: {
            id: {
              in: listSucceed,
            },
          },
          data: {
            status: 'SUCCEED',
          },
        });
      }
      if (listFailed.length > 0) {
        await this.prisma.boxCampaignBuyHistory.updateMany({
          where: {
            id: {
              in: listFailed.map((item) => item.id),
            },
          },
          data: {
            status: 'FAILED',
            data: 'Revert buy EVM',
          },
        });

        await this._updateSoldAmountWhenBuyFailed(listFailed);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  // async _allowanceEnough(
  //   address: string,
  //   quantity: number,
  //   price: string | number,
  //   boxCampaignUid: string,
  //   chainSymbol: ChainSymbol,
  //   currencyUid: string,
  // ) {
  //   const boxContractCacheKey = 'box_contract' + boxCampaignUid + chainSymbol;
  //   let boxContract = await this.cache.get<BoxContract>(boxContractCacheKey);
  //   if (!boxContract) {
  //     boxContract = await this.prisma.boxContract.findUnique({
  //       where: {
  //         box_campaign_uid_chain_symbol: {
  //           box_campaign_uid: boxCampaignUid,
  //           chain_symbol: chainSymbol,
  //         },
  //       },
  //       include: {
  //         chain: true,
  //       },
  //     });
  //     await this.cache.set(boxContractCacheKey, boxContract);
  //   }
  //   if (!boxContract) {
  //     throw new AppError('Box contract not found');
  //   }

  //   const allowance = await this.bcService.getAllowance(
  //     address,
  //     boxContract.address,
  //     currencyUid,
  //   );
  //   // console.log('allowance: ', allowance);
  //   if (allowance >= MathHelper.mul(price, quantity).toNumber()) {
  //     return true;
  //   }
  //   return false;
  // }

  async _updateSoldAmountWhenBuyFailed(listFailed: BoxCampaignBuyHistory[]) {
    if (listFailed.length === 0) {
      return;
    }
    // update sold amount of box type
    const listBoxTypeFailed: { [key: string]: number } = {};
    // get total bought each box type
    for (const item of listFailed) {
      listBoxTypeFailed[item.box_price['box_type_uid'] ?? ''] =
        (listBoxTypeFailed[item.box_price['box_type_uid'] ?? ''] ?? 0) +
        item.quantity;
    }
    await this.prisma.$transaction(
      Object.keys(listBoxTypeFailed).map((boxTypeUid) =>
        this.prisma.boxType.update({
          where: {
            uid: boxTypeUid,
          },
          data: {
            sold_amount: {
              decrement: listBoxTypeFailed[boxTypeUid],
            },
          },
        }),
      ),
    );
  }

  async sendEmail(
    emailType: EmailType,
    campaignName: string,
    user: BoxCampaignSubscribes[],
  ) {
    user.forEach(async (item) => {
      if (!checkUser.has(item.user_id) && !checkEmailType.has(emailType)) {
        await this.emailService.sendEmailNotifications(
          item.user_id,
          emailType,
          campaignName,
        );
        checkUser.set(item.user_id, true);
        checkEmailType.set(emailType, true);
      }
    });
  }

  // push email to user
  @Cron(EVERY_1_MINUTES)
  async pushEmail() {
    const now: number = new Date().valueOf();
    const boxCampaign = await this.prisma.boxCampaign.findMany();
    for (let loop = 0; loop < boxCampaign.length; loop++) {
      const item = boxCampaign[loop];

      // get user who subscribes campaign
      const user = await this.prisma.boxCampaignSubscribes.findMany({
        where: {
          box_campaign_uid: item.uid,
        },
      });

      if (user.length == 0) continue;
      // check sold out
      const boxType = await this.prisma.boxType.findMany({
        where: {
          box_campaign_uid: item.uid,
        },
      });
      let check: boolean = false;
      for (let i = 0; i < boxType.length; i++) {
        if (boxType[i].total_amount != boxType[i].sold_amount) {
          check = true;
          break;
        }
      }
      if (!check) {
        const user = await this.prisma.boxCampaignSubscribes.findMany({
          where: {
            box_campaign_uid: item.uid,
          },
        });
        user.forEach(async (data) => {
          if (
            !checkUser.has(data.user_id) &&
            !checkEmailType.has(EmailType.campaignClose)
          ) {
            await this.emailService.sendEmailNotifications(
              data.user_id,
              EmailType.campaignClose,
              item.name,
            );
            checkUser.set(data.user_id, true);
            checkEmailType.set(EmailType.campaignClose, true);
          }
        });
        continue;
      }

      // get rounds from box campaign
      let rounds: BoxCampaignRound[];
      if (typeof item.rounds === 'object' && Array.isArray(item.rounds)) {
        const temp: any = item.rounds;
        rounds = temp;
      }

      // get time from campaign
      const timeStartWhitelistRegister: number = new Date(item.start).valueOf();
      const timeStartWhitelistPhase: number = new Date(
        item.opening_at,
      ).valueOf();
      const timeStartBuyPhase: number = new Date(rounds[2].start).valueOf();
      const timeEndBuyPhase: number = new Date(item.end).valueOf();

      // check time
      if (
        timeStartWhitelistRegister - now <= ONE_DAY &&
        timeStartWhitelistRegister - now >= 0
      ) {
        await this.sendEmail(
          EmailType.whitelistRegisterAfterOneDay,
          item.name,
          user,
        );
      }
      if (
        timeStartWhitelistRegister - now <= FIFTEEN_MINUTES &&
        timeStartWhitelistRegister - now >= 0
      ) {
        await this.sendEmail(
          EmailType.whitelistRegisterAfter15Minutes,
          item.name,
          user,
        );
      }
      if (
        timeStartWhitelistPhase - now <= ONE_DAY &&
        timeStartWhitelistPhase - now >= 0
      ) {
        await this.sendEmail(
          EmailType.whitelistOpenAfterOneDay,
          item.name,
          user,
        );
      }
      if (
        timeStartWhitelistPhase - now <= FIFTEEN_MINUTES &&
        timeStartWhitelistPhase - now >= 0
      ) {
        await this.sendEmail(
          EmailType.whitelistOpenAfter15Min,
          item.name,
          user,
        );
      }
      if (timeStartBuyPhase - now <= ONE_DAY && timeStartBuyPhase - now >= 0) {
        await this.sendEmail(
          EmailType.boxCampaignOpenAfterOneDay,
          item.name,
          user,
        );
      }
      if (
        timeStartBuyPhase - now <= FIFTEEN_MINUTES &&
        timeStartBuyPhase - now >= 0
      ) {
        await this.sendEmail(
          EmailType.boxCampaignOpenAfter15Minutes,
          item.name,
          user,
        );
      }
      if (timeEndBuyPhase - now <= 0) {
        await this.sendEmail(EmailType.campaignClose, item.name, user);
      }
    }
  }
}
