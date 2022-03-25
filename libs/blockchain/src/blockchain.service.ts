import { MathHelper } from '@lib/helper';
import { AppError } from '@lib/helper/errors/base.error';
import { PrismaService } from '@lib/prisma';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import {
  BoxContract,
  BoxPrice,
  Chain,
  ChainSymbol,
  Currency,
} from '@prisma/client';
import { Cache } from 'cache-manager';
import { BoxNft } from './_utils/box_nft';
import { Erc20 } from './_utils/erc20';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async getBalance(address: string, currencyUid: string): Promise<number> {
    const cacheKey = 'currency_' + currencyUid;
    let currency = await this.cache.get<Currency & { chain: Chain }>(cacheKey);
    if (!currency) {
      currency = await this.prisma.currency.findUnique({
        where: {
          uid: currencyUid,
        },
        include: {
          chain: true,
        },
      });
      await this.cache.set(cacheKey, currency);
    }
    // console.log('currency: ', currency);
    if (!currency) {
      throw new AppError('NOT_FOUND', 'NOT_FOUND');
    }

    switch (currency.chain_symbol.toLowerCase()) {
      case 'eth':
      case 'bsc':
        const result = await Erc20.balanceOf(
          currency.chain,
          currency.address,
          address,
        );
        const balance = MathHelper.div(result, 1e18).toNumber();
        return balance;
      default:
        throw new AppError('UNSUPPORTED_CHAIN', 'UNSUPPORTED_CHAIN');
    }
  }

  async getAllowance(
    ownerAddress: string,
    boxPrice: BoxPrice & { currency: Currency & { chain: Chain } },
  ): Promise<number> {
    if (!boxPrice.contract_address) {
      throw new AppError('Box contract not config');
    }
    switch (boxPrice.currency.chain.symbol.toLowerCase()) {
      case 'eth':
      case 'bsc':
        const result = await Erc20.allowance(
          boxPrice.currency.chain,
          boxPrice.currency.address,
          ownerAddress,
          boxPrice.contract_address,
        );
        // console.log('result: ', result);
        return result;
      default:
        throw new AppError('UNSUPPORTED_CHAIN', 'UNSUPPORTED_CHAIN');
    }
  }

  async buyBox(
    toAddress: string,
    quantity: number,
    boxPrice: BoxPrice & {
      currency: Currency & { chain: Chain };
      contract: BoxContract;
    },
  ): Promise<string> {
    if (!boxPrice.contract_address) {
      throw new AppError('Box contract not config');
    }

    switch (boxPrice.currency.chain.symbol.toLowerCase()) {
      case 'eth':
      case 'bsc':
        const result = await BoxNft.buyBox(
          boxPrice.currency.chain,
          boxPrice.contract_address,
          toAddress,
          boxPrice.box_type_uid,
          quantity,
          boxPrice.contract.admin_prv_key,
        );
        // console.log('result: ', result);
        return result;
      default:
        throw new AppError('UNSUPPORTED_CHAIN', 'UNSUPPORTED_CHAIN');
    }
  }

  async getTransaction(tx_hash: string, chain_symbol: ChainSymbol) {
    const cacheKey = 'chain_' + chain_symbol;
    let chain = await this.cache.get<Chain>(cacheKey);
    if (!chain) {
      chain = await this.prisma.chain.findUnique({
        where: {
          symbol: chain_symbol,
        },
      });
      await this.cache.set(cacheKey, chain);
    }
    // console.log('currency: ', currency);
    if (!chain) {
      throw new AppError('NOT_FOUND', 'NOT_FOUND');
    }

    switch (chain.symbol.toLowerCase()) {
      case 'eth':
      case 'bsc':
        const result = await Erc20.transaction(chain, tx_hash);
        // console.log('result: ', result);
        return result;
      default:
        throw new AppError('UNSUPPORTED_CHAIN', 'UNSUPPORTED_CHAIN');
    }
  }

  async approve(
    spender: string,
    amount: number,
    currency_uid: string,
    prvKey: string,
  ) {
    const currency = await this.prisma.currency.findUnique({
      where: {
        uid: currency_uid,
      },
      include: {
        chain: true,
      },
    });
    // console.log('currency: ', currency);
    if (!currency) {
      throw new AppError('NOT_FOUND', 'NOT_FOUND');
    }

    switch (currency.chain_symbol.toLowerCase()) {
      case 'eth':
      case 'bsc':
        const result = await Erc20.approve(
          currency.chain,
          currency.address,
          spender,
          amount,
          prvKey,
        );
        // console.log('result: ', result);
        return result;
      default:
        throw new AppError('UNSUPPORTED_CHAIN', 'UNSUPPORTED_CHAIN');
    }
  }
}
