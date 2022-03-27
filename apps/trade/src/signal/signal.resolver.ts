import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SignalService } from "./signal.service";
import { Signal, SignalInput, SignalObject } from "./shape/Signal";
import { BinanceOrder, BinanceOrderInput, BinanceOrderObject, BinanceTradeType } from "./shape/BinanceOrder";


@Resolver()
export class SignalResolver {
  constructor(private signalService: SignalService) {}

  @Query(() => String, { nullable: true })
  async hello(): Promise<string> {
    return 'HI';
  }

  @Mutation(() => [SignalObject], {
    description: 'fetch new service',
  })
  async extractNewTelegramSignal(): Promise<Signal[]> {
    const result = await this.signalService.extractNewTelegramSignal();
    return result;
  }

  @Mutation(() => BinanceOrderObject, { description: "Create order on binance" })
  async createBinanceOrder(
    @Args("order") order: BinanceOrderInput
  ): Promise<BinanceOrder> {
    return this.signalService.createBinanceOrder(order)
  }

  @Mutation(() => [BinanceOrderObject], { description: "Create order on binance" })
  async createBinanceOrderFromSignal(
    @Args("signal") signal: SignalInput
  ): Promise<[BinanceOrder]> {
    // TODO:
    const orders = this.signalService.toOrderSeries(signal)
    return [await this.createBinanceOrder(null)];
  }
}
