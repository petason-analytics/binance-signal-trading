import { Injectable, Logger } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { Signal } from "./shape/Signal";
import { AppError } from "@lib/helper/errors/base.error";
import { BinanceOrder, BinanceTradeType } from "./shape/BinanceOrder";
import BinanceTradingEndpoint from "@lib/helper/binance/BinanceTradingEndpoint";
import { EndpointError, OrderInput } from "@lib/helper/binance/TradingEndpoint";


@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  async extractNewTelegramSignal(): Promise<Signal[]> {
    throw new AppError("Use signal from telethon client instead", 'DEPRECATED')
  }

  async createBinanceOrder(order: BinanceOrder): Promise<BinanceOrder> {
    const new_order: OrderInput = {
      symbol: "XLMETH",
      side: "BUY", // BUY,SELL
      // @ts-ignore
      type: "LIMIT", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
      quantity: "100",
      price: "0.0002",
      // newClientOrderId, // A unique id for the order. Automatically generated if not sent.
      newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
    };

    const res = await BinanceTradingEndpoint.getInstance().order(new_order, false)
    console.log('{SignalService.createBinanceOrder} res: ', res);
    if ((res as EndpointError).code && (res as EndpointError).e) {
      throw new AppError((res as EndpointError).message, "Binance_ErrorCodes_" + (res as EndpointError).code as unknown as string);
    }

    return order
  }

  toOrderSeries(signal: Signal): [BinanceOrder] {
    // a signal can generate multiple order
    // TODO:
    return [
      {
        created_at: new Date(),
        entry: new BigNumber("123.4567890"),
        symbol: "BTCUSDT",
        trade_type: BinanceTradeType.BuyLimit
      }
    ]
  }
}
