import {
  BinanceAmountMaxDecimal,
  BinanceOrder,
  BinanceOrderObject,
  BinanceTradeType,
  getBinanceTradeType,
} from "../../../../apps/trade/src/signal/shape/BinanceOrder";
import { Price, SignalInput } from "../../../../apps/trade/src/signal/shape/Signal";
import BinanceTradingEndpoint from "@lib/helper/binance/BinanceTradingEndpoint";
import { Order as BinanceOrderResponse } from "binance-api-node";
import { EndpointError, OrderInput } from "@lib/helper/binance/TradingEndpoint";
import BigNumber from "bignumber.js";
import { AppError } from "@lib/helper/errors/base.error";


export class SignalTrading {
  private static instance: SignalTrading;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): SignalTrading {
    if (!SignalTrading.instance) {
      SignalTrading.instance = new SignalTrading();
    }

    return SignalTrading.instance;
  }

  public async onNewSignal(signal: SignalInput): Promise<BinanceOrder[]> {
    let signal_orders: BinanceOrderResponse[] = await this.createSmartOrders(signal)

    // TP with 3 level of TP
    // SL: 50%
    // Trailing SL
    // SL if order is opened over 2 weeks

    console.log('{SignalTrading.onNewSignal} signal_orders: ', signal_orders);

    const new_orders_obj: BinanceOrder[] = [];

    for (let i = 0, c = signal_orders.length; i < c; i++) {
      const item = signal_orders[i];
      const bo: BinanceOrder = {
        id: item.orderId,
        amount: new BigNumber(item.executedQty),
        entry: new BigNumber(item.price),
        symbol: item.symbol,
        trade_type: getBinanceTradeType(item)
      };
      new_orders_obj.push(bo)
    }

    return new_orders_obj
  }

  private async createSmartBuyOrder(buyOrder: BinanceOrder, tp: Price, sl: Price): Promise<BinanceOrderResponse[]> {
    /**
     * Smart flow:
     * - order
     * - tp
     * - sl
     * - tuning by trailing_sl
     * - clean by expired_sl
     */
    const primary_order: BinanceOrderResponse = await this._createBinanceOrder(buyOrder, false);

    let take_profit_order: BinanceOrderResponse
    try {
      take_profit_order = await this._createBinanceOrder({
        ...buyOrder,
        trade_type: BinanceTradeType.SellLimit,
        entry: tp,
      }, false);
    } catch (e) {
      console.error('{createSmartBuyOrder} e: ', e);
    }

    let stop_loss_order: BinanceOrderResponse;
    try {
      stop_loss_order = await this._createBinanceOrder({
        ...buyOrder,
        trade_type: BinanceTradeType.SellStop,
        entry: sl,
      }, false);
    } catch (e) {
      console.error('{createSmartBuyOrder} e: ', e);
    }

    // TODO: tuning by trailing_sl
    // TODO: clean by expired_sl

    console.log('{SignalTrading.createSmartBuyOrder} primary_order: ', primary_order);
    console.log('{SignalTrading.createSmartBuyOrder} take_profit_order: ', take_profit_order);
    console.log('{SignalTrading.createSmartBuyOrder} stop_loss_order: ', stop_loss_order);

    return [primary_order, take_profit_order, stop_loss_order]
  }

  private async createSmartOrders(signal: SignalInput): Promise<BinanceOrderResponse[]> {
    console.log('{SignalTrading.createSmartOrders} signal: ', signal);

    let new_orders: BinanceOrderResponse[] = [];

    // calculate balance
    const TP1_EQUITY_PERCENT = 20;
    const TP2_EQUITY_PERCENT = 2.5;
    const TP3_EQUITY_PERCENT = 0.5;
    await BinanceTradingEndpoint.getInstance().refresh_usdt_balance();
    const usdt_balance = BinanceTradingEndpoint.getInstance().usdt_balance;
    const tp1_trade_vol_usdt = usdt_balance * TP1_EQUITY_PERCENT / 100;
    const tp2_trade_vol_usdt = usdt_balance * TP2_EQUITY_PERCENT/ 100;
    const tp3_trade_vol_usdt = usdt_balance * TP3_EQUITY_PERCENT / 100;

    // trade 8% each signal (assume that 12 order opening at the same time)
    /*
    tp1: 5%
    tp2: 2.5%
    tp3: 0.5%
     */
    const max_open_order = Math.floor(100 / (TP1_EQUITY_PERCENT + TP2_EQUITY_PERCENT + TP3_EQUITY_PERCENT));

    const openOrders = await BinanceTradingEndpoint.getInstance().fetch_all_open_orders();
    console.log('{SignalTrading.onNewSignal} openOrders: ', openOrders);
    // TODO: update all order status to db

    // query back from db
    const tp1_opening_count = 0; //"TODO";
    const tp2_opening_count = 0; //"TODO";
    const tp3_opening_count = 0; //"TODO";


    if (tp1_opening_count >= max_open_order) {
      // TODO:
      // skip level 1
      // notice via telegram to liquid some order manually
      console.warn("[WARN] tp1_opening_count >= max_open_order", tp1_opening_count, max_open_order)
      return new_orders;
    }

    // NOTE: assume that current price ~~ entry
    // For more accuracy, plz fetch the the live price
    const current_price = new BigNumber(signal.entry).toNumber();
    const spot_order: BinanceOrder = {
      symbol: signal.symbol,
      trade_type: BinanceTradeType.BuyMarket,
      amount: new BigNumber(0),
      entry: signal.entry
    }

    // const tp1_order: BinanceOrderResponse = await this._createBinanceOrder({
    //   ...spot_order,
    //   amount: new BigNumber(SignalTrading.usdt2coin(tp1_trade_vol_usdt, current_price)),
    // }, false);
    // new_orders.push(tp1_order)
    const tp1_orders: BinanceOrderResponse[] = await this.createSmartBuyOrder(
      {
        ...spot_order,
        amount: new BigNumber(SignalTrading.usdt2coin(tp1_trade_vol_usdt, current_price))
      },
      signal.tp1,
      // signal.entry.div(2) // sl at 50%
      signal.sl,
    );
    new_orders = new_orders.concat(tp1_orders)

    if (tp2_opening_count >= max_open_order) {
      // TODO:
      // skip level 2
      // notice via telegram to liquid some order manually
      console.warn("[WARN] tp2_opening_count >= max_open_order", tp2_opening_count, max_open_order)

      return new_orders;
    }

    const tp2_orders: BinanceOrderResponse[] = await this.createSmartBuyOrder(
      {
        ...spot_order,
        amount: new BigNumber(SignalTrading.usdt2coin(tp2_trade_vol_usdt, current_price))
      },
      signal.tp2,
      signal.sl,
    );
    new_orders = new_orders.concat(tp2_orders)


    if (tp3_opening_count >= max_open_order) {
      // TODO:
      // skip level 3
      // notice via telegram to liquid some order manually
      console.warn("[WARN] tp3_opening_count >= max_open_order", tp3_opening_count, max_open_order)

      return new_orders;
    }
    const tp3_orders: BinanceOrderResponse[] = await this.createSmartBuyOrder(
      {
        ...spot_order,
        amount: new BigNumber(SignalTrading.usdt2coin(tp3_trade_vol_usdt, current_price))
      },
      signal.tp3,
      signal.sl,
    );
    new_orders = new_orders.concat(tp3_orders)

    console.log('{createSmartOrders} new_orders: ', new_orders);

    return new_orders;
  }

  private async equity_mng__sl() {
    // TODO
  }
  private async tuning__trailing_sl() {
    // TODO
  }
  private async cleanup__expired_sl() {
    // TODO
  }

  private async _createBinanceOrder(order: BinanceOrder, dry_run: boolean = false): Promise<BinanceOrderResponse> {
    console.log('{SignalTrading.createBinanceOrder} order: ', order);
    const maxDecimal = BinanceAmountMaxDecimal[order.symbol];
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
    console.log('{SignalTrading.createBinanceOrder} res: ', res);
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

    return res as BinanceOrderResponse
  }

  public static usdt2coin(usdt_amount: number, price: number): number {
    return usdt_amount / price
  }

  public static coin2usdt(coin_amount: number, price: number): number {
    return coin_amount * price
  }
}
