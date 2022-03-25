import { BlockchainService } from '@lib/blockchain';
import { PrismaService } from '@lib/prisma';
import { Injectable } from '@nestjs/common';
import { Logger } from 'ethers/lib/utils';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prisma: PrismaService,
    private bcService: BlockchainService,
  ) {}

  async approveContract(
    spender: string,
    amount: number,
    currency_uid: string,
    prvKey: string,
  ): Promise<string> {
    const result = await this.bcService.approve(
      spender,
      amount,
      currency_uid,
      prvKey,
    );
    return result.hash;
  }
}
