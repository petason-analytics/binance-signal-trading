import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SignalService } from "./signal.service";
import { Price, Signal, SignalInput, SignalObject, SignalType } from "./shape/Signal";
import { BinanceOrder, BinanceOrderInput, BinanceOrderObject, BinanceTradeType } from "./shape/BinanceOrder";
import { SignalTrading } from "@lib/helper/binance/SignalTrading";
import BigNumber from "bignumber.js";


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

  /*
  mutation createOrder {
    createBinanceOrder(
      order: {
        trade_type: BuyMarket
        symbol: "TRXUSDT"
        amount: "180.2689",
        entry: "0.0599"
      }
      dry_run: true
    ) {
      symbol
      entry
      trade_type
      amount
    }
  }
   */
  @Mutation(() => BinanceOrderObject, { description: "Create order on binance" })
  async createBinanceOrder(
    @Args("order") order: BinanceOrderInput,
    @Args("dry_run", { nullable: true }) dry_run: boolean,
  ): Promise<BinanceOrder> {
    return this.signalService.createBinanceOrder(order, dry_run)
  }

  @Mutation(() => [BinanceOrderObject], { description: "Create order on binance" })
  async createBinanceOrderFromSignal(
    @Args("signal") signal_input: SignalInput,
    // @Args("dry_run", { nullable: true }) dry_run: boolean,
  ): Promise<BinanceOrder[]> {
    const signal = {
      ...signal_input,
      entry: new BigNumber(signal_input.entry),
      sl: new BigNumber(signal_input.sl),
      tp1: new BigNumber(signal_input.tp1),
      tp2: new BigNumber(signal_input.tp2),
      tp3: new BigNumber(signal_input.tp3),
      tp4: new BigNumber(signal_input.tp4),
      tp5: new BigNumber(signal_input.tp5),
    };
    const orders = await SignalTrading.getInstance().onNewSignal(signal, SignalType.primary)
    return orders;
  }
}
