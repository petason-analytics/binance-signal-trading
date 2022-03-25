import { AppError } from '@lib/helper/errors/base.error';
import { BoxCampaignRound, PrismaService } from '@lib/prisma';
import { BoxCampaignBuyHistoryCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign-buy-history/box-campaign-buy-history-create.input';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import {
  BoxCampaign,
  BoxCampaignBuyHistoriesStatus,
  BoxPrice,
  BoxType,
  Chain,
  Currency,
  Prisma,
} from '@prisma/client';
import { UserService } from '../user/user.service';
import { BuyBoxInput } from './dto/BuyBoxInput';
import { BlockchainService } from '@lib/blockchain';
import { MathHelper } from '@lib/helper';
import { Cache } from 'cache-manager';
import {
  GBoxCampaign,
  GBoxCampaignInclude,
  GBoxType,
  WhitelistStatus,
} from './dto/box-campaign.dto';
import { EmailService } from '../email/email.service';
import { EmailInput, EmailType, UserInput } from '../email/email.type';
import { create } from 'domain';
@Injectable()
export class BoxCampaignService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private userSv: UserService,
    private bcService: BlockchainService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private emailSv: EmailService,
  ) {}

  async splotlightBoxCampaign() {
    const result = await this.prisma.boxCampaign.findMany({
      where: {
        spotlight_position: {
          gte: 0,
        },
      },
      include: {
        game: true,
        boxTypes: {
          include: {
            prices: {
              include: {
                currency: {
                  include: {
                    chain: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result;
  }

  async upcomingBoxCampaign() {
    const result = await this.boxCampaigns(
      {
        opening_at: {
          gt: new Date(),
        },
      },
      {
        game: true,
        boxTypes: {
          include: {
            prices: {
              include: {
                currency: {
                  include: {
                    chain: true,
                  },
                },
              },
            },
          },
        },
      },
    );
    return result;
  }

  async openingBoxCampaign() {
    const current = new Date();
    const result = await this.boxCampaigns(
      {
        opening_at: {
          lte: current,
        },
        end: {
          gte: current,
        },
      },
      {
        game: true,
        boxTypes: {
          include: {
            prices: {
              include: {
                currency: {
                  include: {
                    chain: true,
                  },
                },
              },
            },
          },
        },
      },
    );
    return result;
  }

  async closedBoxCampaign() {
    const current = new Date();
    const result = await this.boxCampaigns(
      {
        end: {
          lt: current,
        },
      },
      {
        game: true,
        boxTypes: {
          include: {
            prices: {
              include: {
                currency: {
                  include: {
                    chain: true,
                  },
                },
              },
            },
          },
        },
      },
    );
    return result;
  }

  async boxCampaigns(
    where: Prisma.BoxCampaignWhereInput,
    include?: Prisma.BoxCampaignInclude,
  ) {
    const result = await this.prisma.boxCampaign.findMany({
      where: where,
      include,
    });
    return result;
  }

  async campaignDetail(
    where: Prisma.BoxCampaignWhereUniqueInput,
    include: GBoxCampaignInclude,
  ) {
    const includeData: Prisma.BoxCampaignInclude = {};
    if (include.game === true) {
      includeData.game = true;
    }
    if (include.boxTypes === true) {
      if (include.boxPrices) {
        if (include.chain || include.currency) {
          includeData.boxTypes = {
            include: {
              prices: {
                include: {
                  currency:
                    include.chain == true
                      ? {
                          include: {
                            chain: true,
                          },
                        }
                      : true,
                },
              },
            },
          };
        } else {
          includeData.boxTypes = {
            include: {
              prices: true,
            },
          };
        }
      } else {
        includeData.boxTypes = true;
      }
    }
    // console.log('includeData: ', includeData);
    const result = await this.prisma.boxCampaign.findUnique({
      where: where,
      include: Object.keys(includeData).length > 0 ? includeData : null,
    });
    return result;
  }

  async buyBoxHistories(
    where: Prisma.BoxCampaignBuyHistoryWhereInput,
    include?: any,
  ) {
    const result = await this.prisma.boxCampaignBuyHistory.findMany({
      where: where,
      include,
    });
    return result;
  }

  async allBoxCampaign() {
    const result = await this.boxCampaigns({});
    return result;
  }

  async isInWhitelist(box_campaign_uid: string, user_id: number) {
    const whitelist = await this.prisma.boxCampaignWhitelist.findUnique({
      where: {
        user_id_box_campaign_uid: {
          box_campaign_uid,
          user_id,
        },
      },
    });
    if (!!whitelist) {
      return true;
    }
    return false;
  }

  async getRegisteredWhitelist(
    box_campaign_uid: string,
  ): Promise<WhitelistStatus> {
    // must exist whitelist round
    let campaign = await this.cache.get<BoxCampaign>(box_campaign_uid);
    if (!campaign) {
      campaign = await this.prisma.boxCampaign.findUnique({
        where: {
          uid: box_campaign_uid,
        },
      });
    }
    if (!campaign) {
      throw new AppError('Campaign not found');
    }

    let rounds: BoxCampaignRound[] = [];
    if (typeof campaign.rounds === 'object' && Array.isArray(campaign.rounds)) {
      const temp: any = campaign.rounds;
      rounds = temp;
    }
    // console.log('rounds: ', rounds);
    const whitelistRound = rounds.find((item) => item.is_whitelist === true);
    if (!whitelistRound) {
      throw new AppError('Whitelist round not found');
    }

    const participantLimit = whitelistRound.participant_limit ?? 0;
    const totalRegister = await this.prisma.boxCampaignWhitelist.count({
      where: {
        box_campaign_uid,
      },
    });

    return {
      box_campaign_uid,
      limit: participantLimit,
      registered: totalRegister,
    };
  }

  //Mutation
  async registerWhitelist(
    box_campaign_uid: string,
    user_id: number,
  ): Promise<[number, number]> {
    // must exist whitelist round
    let campaign = await this.cache.get<BoxCampaign>(box_campaign_uid);
    if (!campaign) {
      campaign = await this.prisma.boxCampaign.findUnique({
        where: {
          uid: box_campaign_uid,
        },
      });
    }
    if (!campaign) {
      throw new AppError('Campaign not found');
    }

    let rounds: BoxCampaignRound[] = [];
    if (typeof campaign.rounds === 'object' && Array.isArray(campaign.rounds)) {
      const temp: any = campaign.rounds;
      rounds = temp;
    }
    // console.log('rounds: ', rounds);
    const whitelistRound = rounds.find((item) => item.is_whitelist === true);
    if (!whitelistRound) {
      throw new AppError('Whitelist not found');
    }

    // current time in whitelist time
    const currentTime = new Date().getTime();
    const startWhitelistTime = new Date(whitelistRound.start);
    const endWhitelistTime = new Date(whitelistRound.end);
    if (!startWhitelistTime || !endWhitelistTime) {
      throw new AppError('Invalid time format');
    }
    if (
      currentTime < startWhitelistTime.getTime() ||
      currentTime > endWhitelistTime.getTime()
    ) {
      throw new AppError("Can't register right now");
    }
    // check user registered
    const whitelist = await this.prisma.boxCampaignWhitelist.findUnique({
      where: {
        user_id_box_campaign_uid: {
          box_campaign_uid: box_campaign_uid,
          user_id,
        },
      },
    });
    if (!!whitelist) {
      throw new AppError('You registered whitelist');
    }
    // Check limit user
    const participantLimit = whitelistRound.participant_limit ?? 0;
    let totalRegister: number;
    if (participantLimit > 0) {
      totalRegister = await this.prisma.boxCampaignWhitelist.count({
        where: {
          box_campaign_uid,
        },
      });
      if (totalRegister >= participantLimit) {
        throw new AppError("Can't register now by reach limit");
      }
    }
    await this.prisma.boxCampaignWhitelist.create({
      data: {
        user_id,
        campaign: {
          connect: {
            uid: box_campaign_uid,
          },
        },
      },
    });
    const countWhitelist: number = totalRegister + 1;
    this.emailSv.sendEmailNotifications(
      user_id,
      EmailType.registerWhitelist,
      campaign.name,
    );
    return [countWhitelist, participantLimit];
  }

  // Buy box
  async buyBox(
    input: BuyBoxInput,
  ): Promise<[number, number, number, string, GBoxType]> {
    if (input.quantity <= 0) {
      throw new AppError('Quantity must greate than 0');
    }
    let boxPrice = await this.cache.get<
      BoxPrice & {
        boxType: BoxType & {
          campaign: BoxCampaign;
        };

        currency: Currency & { chain: Chain };
      }
    >(input.box_price_uid);
    if (!boxPrice) {
      boxPrice = await this.prisma.boxPrice.findUnique({
        where: {
          uid: input.box_price_uid,
        },
        include: {
          boxType: {
            include: {
              campaign: true,
            },
          },
          currency: {
            include: {
              chain: true,
            },
          },
          contract: true,
        },
      });
    }

    const boxCampaign = boxPrice.boxType.campaign;

    if (!boxPrice || !boxCampaign) {
      throw new AppError('Box not found');
    }

    let rounds: BoxCampaignRound[] = [];
    if (
      typeof boxPrice.boxType.campaign.rounds === 'object' &&
      Array.isArray(boxPrice.boxType.campaign.rounds)
    ) {
      const temp: any = boxPrice.boxType.campaign.rounds;
      rounds = temp;
    }
    // console.log('rounds: ', rounds);

    const buyRound = rounds.find((round) => round.id === input.round_id);
    if (!buyRound) {
      throw new AppError('Round not exist');
    }
    if (buyRound.is_whitelist === true) {
      throw new AppError('Invalid round');
    }

    // Check time can buy
    if (!this._timeBetween(buyRound.start, buyRound.end)) {
      throw new AppError("Can't buy now");
    }
    // Check rule can buy (whitelist, quantity)
    if (buyRound.require_whitelist === true) {
      // check registered whitelist
      if (!(await this._isInWhiteList(boxCampaign.uid, input.user_id))) {
        throw new AppError('Not registered whitelist');
      }
    }
    // check max quantity can buy follow box type
    const totalBought = await this._totalBought(
      boxPrice.box_type_uid,
      input.user_id,
    );
    if (
      !!boxPrice.boxType.limit_per_user &&
      input.quantity + totalBought > boxPrice.boxType.limit_per_user
    ) {
      throw new AppError(
        `Each user can buy up to ${boxPrice.boxType.limit_per_user} boxes. You bought ${totalBought} boxes before`,
      );
    }
    // Check box remain can buy
    if (
      input.quantity >
      boxPrice.boxType.total_amount - boxPrice.boxType.sold_amount
    ) {
      throw new AppError('Not enough box to buy');
    }
    // Check balance
    const user = await this.userSv.user({
      id: input.user_id,
    });
    if (!user) {
      throw new AppError('Bad request');
    }

    const pendingQuantity = await this._pendingBought(
      boxPrice.box_type_uid,
      input.user_id,
    );
    const totalQuantity = input.quantity + pendingQuantity;
    if (
      !(await this._enoughBalance(
        user.address,
        totalQuantity,
        boxPrice.price.toString(),
        boxPrice.currency_uid,
      ))
    ) {
      throw new AppError('Not enough balance');
    }
    // Check allowance enough
    if (!(await this._allowanceEnough(user.address, totalQuantity, boxPrice))) {
      throw new AppError('Allowance not enough');
    }
    // throw new AppError('Allowance not enough');

    // save tx
    const data = new BoxCampaignBuyHistoryCreateInput();
    data.quantity = input.quantity;
    data.user_id = input.user_id;
    data.box_price_uid = input.box_price_uid;
    data.box_type_uid = boxPrice.box_type_uid;
    data.status = BoxCampaignBuyHistoriesStatus.PENDING;
    const {
      boxType: { campaign, ...boxTypeData },
      currency: { chain, ...currencyData },
      ...boxPriceData
    } = boxPrice;
    data.round = buyRound;
    boxTypeData.sold_amount += 1;

    data.box_price = {
      ...boxPriceData,
      boxType: boxTypeData,
      chain_symbol: chain.symbol,
      chain_icon: chain.icon,
      chain_name: chain.name,
      currency_name: currencyData.name,
      currency_icon: currencyData.icon,
      currency_symbol: currencyData.symbol,
    };
    data.box = { connect: { uid: boxPrice.boxType.box_campaign_uid } };
    const result = await this.prisma.$transaction([
      this.prisma.boxCampaignBuyHistory.create({
        data,
      }),
      // increment sold amount of box type
      this.prisma.boxType.update({
        where: {
          uid: boxPrice.box_type_uid,
        },
        data: {
          sold_amount: {
            increment: input.quantity,
          },
        },
      }),
    ]);
    const boxId = result[0].id;
    const soldAmount = boxPrice.boxType.sold_amount;
    const totalAmount = boxPrice.boxType.total_amount;
    this.emailSv.sendEmailNotifications(
      data.user_id,
      EmailType.successfulTransaction,
      boxCampaign.name,
    );
    return [boxId, soldAmount, totalAmount, boxCampaign.uid, boxTypeData];
  }

  async getAllowanceAmount(address: string, boxPriceUid: string) {
    const boxPrice = await this.prisma.boxPrice.findUnique({
      where: {
        uid: boxPriceUid,
      },
      include: {
        currency: {
          include: {
            chain: true,
          },
        },
      },
    });
    if (!boxPrice.contract_address) {
      throw new AppError('Contract not config');
    }
    const allowance = await this.bcService.getAllowance(address, boxPrice);
    return allowance;
  }

  private async _isInWhiteList(box_campaign_uid: string, user_id: number) {
    const exist = await this.prisma.boxCampaignWhitelist.findFirst({
      where: {
        box_campaign_uid: box_campaign_uid,
        user_id: user_id,
      },
    });
    if (!exist) {
      return false;
    }
    return true;
  }

  private _timeBetween(start: string | Date, end: string | Date) {
    const currentTime = new Date().getTime();
    const startTime = new Date(start);
    const endTime = new Date(end);
    if (!startTime || !endTime) {
      throw new AppError('Invalid time format');
    }
    // Current time in campaign time + in buy round
    if (currentTime < startTime.getTime() || currentTime > endTime.getTime()) {
      return false;
    }
    return true;
  }

  private async _totalBought(box_type_uid: string, user_id: number) {
    const total = await this.prisma.boxCampaignBuyHistory.aggregate({
      where: {
        user_id,
        box_type_uid,
        status: {
          not: 'FAILED',
        },
      },
      _sum: {
        quantity: true,
      },
    });
    return total._sum.quantity;
  }

  private async _pendingBought(box_type_uid: string, user_id: number) {
    const total = await this.prisma.boxCampaignBuyHistory.aggregate({
      where: {
        user_id,
        box_type_uid,
        status: 'PENDING',
      },
      _sum: {
        quantity: true,
      },
    });
    return total._sum.quantity;
  }

  async _enoughBalance(
    address: string,
    quantity: number,
    price: string,
    currencyUid: string,
  ) {
    const balance = await this.bcService.getBalance(address, currencyUid);
    console.log('balance:', balance);

    if (balance < MathHelper.mul(quantity, price).toNumber()) {
      return false;
    }
    return true;
  }

  async _allowanceEnough(
    address: string,
    quantity: number,
    boxPrice: BoxPrice & { currency: Currency & { chain: Chain } },
  ) {
    if (!boxPrice.contract_address) {
      throw new AppError('Box contract not config');
    }

    const allowance = await this.bcService.getAllowance(address, boxPrice);
    // console.log('allowance: ', allowance);
    if (
      allowance >=
      MathHelper.mul(boxPrice.price.toString(), quantity).toNumber()
    ) {
      return true;
    }
    return false;
  }
  async recentlyBox(id: number) {
    const result = await this.prisma.boxCampaignBuyHistory.findUnique({
      where: {
        id: id,
      },
    });
    return result;
  }
}
