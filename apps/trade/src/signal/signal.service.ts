import { Injectable, Logger } from "@nestjs/common";
import BigNumber from "bignumber.js";
import { Signal } from "./shape/Signal";
import { AppError } from "@lib/helper/errors/base.error";
import { BinanceAmountMaxDecimal, BinanceOrder, BinanceTradeType } from "./shape/BinanceOrder";
import BinanceTradingEndpoint, { BinanceTradingEndpointHelper } from "@lib/helper/binance/BinanceTradingEndpoint";
import { EndpointError, OrderInput } from "@lib/helper/binance/TradingEndpoint";


@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  async extractNewTelegramSignal(): Promise<Signal[]> {
    throw new AppError("Use signal from telethon client instead", 'DEPRECATED')
  }

  async createBinanceOrder(order: BinanceOrder, dry_run: boolean = false): Promise<BinanceOrder> {
    console.log('{SignalService.createBinanceOrder} order: ', order);

    const lotSizeFilter = await BinanceTradingEndpointHelper.get_lot_size_filter(order.symbol)
    const maxDecimal = BinanceTradingEndpointHelper.step_size_2_max_decimal(new BigNumber(lotSizeFilter.stepSize).toNumber());

    const new_order: OrderInput = {
      symbol: order.symbol,
      side: order.trade_type.startsWith("Sell") ? "SELL" : "BUY", // BUY,SELL
      // @ts-ignore
      type: "LIMIT", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
      quantity: new BigNumber(order.amount).decimalPlaces(maxDecimal).toString(),
      price: order.entry.toString(),
      // newClientOrderId, // A unique id for the order. Automatically generated if not sent.
      newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
    };

    const res = await BinanceTradingEndpoint.getInstance().order(new_order, dry_run)
    console.log('{SignalService.createBinanceOrder} res: ', res);
    /*
    {
      symbol: 'TRXUSDT',
      orderId: 1724267880,
      orderListId: -1,
      clientOrderId: 'YGR4OtmdqFfCZwlUzUPEzY',
      transactTime: 1648585350864,
      price: '0.06990000',
      origQty: '150.30000000',
      executedQty: '150.30000000',
      cummulativeQuoteQty: '10.50446700',
      status: 'FILLED',
      timeInForce: 'GTC',
      type: 'LIMIT',
      side: 'BUY'
    }
     */

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
        trade_type: BinanceTradeType.BuyLimit,
        symbol: "BTCUSDT",
        amount: new BigNumber(20),
        entry: new BigNumber("123.4567890"),
      }
    ]
  }
}
