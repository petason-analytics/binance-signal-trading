import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PairInfoService } from './pair-info.service';

@Resolver()
export class PairInfoResolver {
  constructor(private pairInfoService: PairInfoService) {}

  @Mutation(() => Number, {
    description: `Listen and trade for only some pairs that contains configured contract address (RedList).
    You can call this multiple time for adding/removing multiple contracts`,
  })
  async setTradingPair(
    @Args('base_symbol', { description: 'symbol on binance' }) base: string,
    @Args('quote_symbol', { description: 'symbol on binance' }) quote: string,
    @Args('enabled', { description: 'Enable / disable trading for this symbol' }) enabled: boolean,
  ): Promise<number> {
    if (enabled) {
      await this.pairInfoService.enablePair(base, quote);
    } else {
      await this.pairInfoService.disablePair(base, quote);
    }

    return Date.now();
  }
}
