import { BinanceAmountMaxDecimal, BinanceOrder, BinanceTradeType, getBinanceTradeType } from "../../../../apps/trade/src/signal/shape/BinanceOrder";
import { Price, Signal, SignalType } from "../../../../apps/trade/src/signal/shape/Signal";
import BinanceTradingEndpoint from "@lib/helper/binance/BinanceTradingEndpoint";
import { NewOcoOrder as BinanceOcoOrderRequest, OcoOrder, Order as BinanceOrderResponse } from "binance-api-node";
import { EndpointError, OrderInput } from "@lib/helper/binance/TradingEndpoint";
import BigNumber from "bignumber.js";
import { AppError } from "@lib/helper/errors/base.error";
import { TelegramChat, TlMsgType } from "../../../../apps/trade/src/signal/lib/TelegramBot";


export class SignalTrading {
  private static instance: SignalTrading;
  private telegram: TelegramChat;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    this.init();
  }

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

  public init() {
    this.telegram = new TelegramChat(
      process.env.TELEGRAM_BOT_TOKEN,
      process.env.TELEGRAM_CHAT_ID__BINANCE,
      "[SignalTrading] "
    );
  }

  /**
   * Test all telegram if it;s can send special chars
   *
   * Eg: This msg will not be sent:
   *  - Bought {"symbol":"TRXUSDT","trade_type":"BuyMarket","amount":"231.81761545909848","entry":"0.0599"} | tp: 0.14 | sl: 0.059
   */
  public async testTelegram() {
    const msg = 'Bought ```{"symbol":"TRXUSDT","trade_type":"BuyMarket","amount":"231.75285365609346","entry":"0.0599"}```  tp: 0.14 sl: 0.059';
    this.telegram.log(msg)
    // console.log(await this.telegram.send([
    //   {type: TlMsgType.Text, text: 'test JSON'},
    //   {type: TlMsgType.Code, text: '{"symbol":"TRXUSDT","trade_type":"BuyMarket","amount":"231.75285365609346","entry":"0.0599"}'}
    // ]))
  }

  public async onNewSignal(signal: Signal, signal_type: SignalType): Promise<BinanceOrder[]> {
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
     * - new signal msg => place buy market order
     * - After buy market order done, create a OCO order (TP & SL) with this order qtty
     */
    const primary_order: BinanceOrderResponse = await this._createBinanceOrder(buyOrder, false);

    console.log('{SignalTrading.createSmartBuyOrder} primary_order: ', primary_order);
    if (new BigNumber(primary_order.executedQty).gt(0)) {
      this.telegram.send([
        { type: TlMsgType.Text, text: "Bought" },
        { type: TlMsgType.Code, text: JSON.stringify(buyOrder) },
        { type: TlMsgType.Text, text: `| tp: ${tp.toString()} | sl: ${sl.toString()}` }
      ]);
    }

    // sleep 15s to wait for the primary order all filled
    await new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 15000);
    });

    // TP & SL by a OCO order
    const tp_sl_order: BinanceOrderResponse[] = await this._createBinanceOCOOrder(buyOrder, primary_order, sl, tp);

    // TODO: tuning by trailing_sl
    // TODO: clean by expired_sl


    console.log("{SignalTrading.createSmartBuyOrder} tp_sl_order: ", tp_sl_order);
    if (tp_sl_order.length > 0) {
      this.telegram.log(`For ${primary_order.symbol}, applied tp=${tp.toString()} sl=${sl.toString()}`);
    }

    return [primary_order].concat(tp_sl_order);
  }

  /**
   * createSmartOrders is too hard to code with spot order,
   *
   * so we change to:
   *
   * NEW FLOW:
   * - new signal msg => place buy market order
   * - After buy market order done, create a OCO order (TP & SL) with this order qtty
   */
  // private async createSmartOrderFlow(signal: SignalInput): Promise<BinanceOrderResponse[]> {
  //
  // }

  private async createSmartOrders(signal: Signal): Promise<BinanceOrderResponse[]> {
    console.log('{SignalTrading.createSmartOrders} signal: ', signal);

    let new_orders: BinanceOrderResponse[] = [];

    // calculate balance
    const TP1_EQUITY_PERCENT = 10;
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

    const openOrders = await BinanceTradingEndpoint.getInstance().fetch_symbol_open_orders(signal.symbol);
    console.log(`{SignalTrading.onNewSignal} ${signal.symbol} openOrders: `, openOrders);
    // TODO: update all order status to db


    const TP1_ENABLED = true;
    const TP2_ENABLED = false;
    const TP3_ENABLED = false;

    /**
     * Why tp1 opening count = 1/2 open orders
     * Because we disabled tp2, tp3 so all order is tp1
     * Each tp1 is a market order + OCO order
     * So open_orders count will be OCO order = 2 real-life order
     */
    const tp1_opening_count = Math.floor(openOrders.length / 2);
    const tp2_opening_count = 0; //"TODO"; // query back from db
    const tp3_opening_count = 0; //"TODO"; // query back from db


    if (!TP1_ENABLED) {
      return new_orders;
    }
    if (!signal.tp1.gt(0)) {
      console.warn("[WARN] signal.tp1 is !lt0", signal.tp1)
      return new_orders;
    }
    if (tp1_opening_count >= max_open_order) {
      // skip level 1
      // notice via telegram to liquid some order manually
      this.telegram.warn(`tp1_opening_count(${tp1_opening_count}) >= max_open_order(${max_open_order})`);
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



    if (!TP2_ENABLED) {
      return new_orders;
    }
    if (!signal.tp2.gt(0)) {
      console.warn("[WARN] signal.tp2 is !lt0", signal.tp2)
      return new_orders;
    }
    if (tp2_opening_count >= max_open_order) {
      // skip level 2
      // notice via telegram to liquid some order manually
      this.telegram.warn(`tp2_opening_count(${tp2_opening_count}) >= max_open_order(${max_open_order})`);
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



    if (!TP3_ENABLED) {
      return new_orders;
    }
    if (!signal.tp3.gt(0)) {
      console.warn("[WARN] signal.tp3 is !lt0", signal.tp3)
      return new_orders;
    }
    if (tp3_opening_count >= max_open_order) {
      // skip level 3
      // notice via telegram to liquid some order manually
      this.telegram.warn(`tp3_opening_count(${tp3_opening_count}) >= max_open_order(${max_open_order})`);
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


    return new_orders;
  }

  private async _createBinanceOrder(order: BinanceOrder, dry_run: boolean = false): Promise<BinanceOrderResponse> {
    console.log('{SignalTrading.createBinanceOrder} order: ', order);

    // Skip if price has moved >= 10%
    // if (order.entry) {
    //   // Implement later
    // }

    const maxDecimal = BinanceAmountMaxDecimal[order.symbol];
    const new_order: OrderInput = {
      symbol: order.symbol,
      side: order.trade_type.startsWith("Sell") ? "SELL" : "BUY", // BUY,SELL
      // @ts-ignore
      type: "MARKET", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
      quantity: new BigNumber(order.amount).decimalPlaces(maxDecimal).toString(),
      // price: order.entry.toString(),
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
      await this.telegram.error(JSON.stringify(res))
      throw new AppError((res as EndpointError).message, "Binance_ErrorCodes_" + (res as EndpointError).code as unknown as string);
    }

    return res as BinanceOrderResponse
  }

  private async _createBinanceOCOOrder(order: BinanceOrder, primary_order: BinanceOrderResponse, sl: BigNumber, tp: BigNumber): Promise<BinanceOrderResponse[]> {
    // console.log('{SignalTrading._createBinanceOCOOrder} order, primary_order, sl, tp: ', order, primary_order, sl, tp);
    const maxVolDecimal = BinanceAmountMaxDecimal[order.symbol];
    const maxPriceDecimal = 5; // TODO: Base on: Minimum Price Movement

    const origQtty = new BigNumber(primary_order.origQty);
    const FEE_PERCENT = 0.5;
    const ocoQtty = origQtty.minus(origQtty.multipliedBy(FEE_PERCENT / 100)); // real owned amount = primary_order.executedQtty - transaction fee + some other fee I dont know
    const new_order: BinanceOcoOrderRequest = {
      symbol: primary_order.symbol,
      side: primary_order.side == "SELL" ? "BUY" : "SELL", // opposite as primary order
      // quantity: new BigNumber(primary_order.executedQty).decimalPlaces(maxVolDecimal).toString(),
      quantity: ocoQtty.decimalPlaces(maxVolDecimal).toString(), // Use this if buy limit
      price: tp.decimalPlaces(maxPriceDecimal).toString(), // of the limit order
      stopPrice: sl.plus(new BigNumber(primary_order.price).minus(sl).multipliedBy(5 / 100)).decimalPlaces(maxPriceDecimal).toString(), // stopPrice is come earlier 5%
      stopLimitPrice: sl.decimalPlaces(maxPriceDecimal).toString(), // of the stop limit
      stopLimitTimeInForce: 'GTC', // https://academy.binance.com/en/articles/understanding-the-different-order-types
      newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
    };

    const res = await BinanceTradingEndpoint.getInstance().orderOco(new_order)
    console.log('{SignalTrading._createBinanceOCOOrder} res: ', res);

    /*
    https://binance-docs.github.io/apidocs/spot/en/#new-oco-trade
    {
      "orderListId": 0,
      "contingencyType": "OCO",
      "listStatusType": "EXEC_STARTED",
      "listOrderStatus": "EXECUTING",
      "listClientOrderId": "JYVpp3F0f5CAG15DhtrqLp",
      "transactionTime": 1563417480525,
      "symbol": "LTCBTC",
      "orders": [
        {
          "symbol": "LTCBTC",
          "orderId": 2,
          "clientOrderId": "Kk7sqHb9J6mJWTMDVW7Vos"
        },
        {
          "symbol": "LTCBTC",
          "orderId": 3,
          "clientOrderId": "xTXKaGYd4bluPVp78IVRvl"
        }
      ],
      "orderReports": [
        {
          "symbol": "LTCBTC",
          "orderId": 2,
          "orderListId": 0,
          "clientOrderId": "Kk7sqHb9J6mJWTMDVW7Vos",
          "transactTime": 1563417480525,
          "price": "0.000000",
          "origQty": "0.624363",
          "executedQty": "0.000000",
          "cummulativeQuoteQty": "0.000000",
          "status": "NEW",
          "timeInForce": "GTC",
          "type": "STOP_LOSS",
          "side": "BUY",
          "stopPrice": "0.960664"
        },
        {
          "symbol": "LTCBTC",
          "orderId": 3,
          "orderListId": 0,
          "clientOrderId": "xTXKaGYd4bluPVp78IVRvl",
          "transactTime": 1563417480525,
          "price": "0.036435",
          "origQty": "0.624363",
          "executedQty": "0.000000",
          "cummulativeQuoteQty": "0.000000",
          "status": "NEW",
          "timeInForce": "GTC",
          "type": "LIMIT_MAKER",
          "side": "BUY"
        }
      ]
    }
     */

    if ((res as EndpointError).code && (res as EndpointError).e) {
      await this.telegram.error(JSON.stringify(res))
      throw new AppError((res as EndpointError).message, "Binance_ErrorCodes_" + (res as EndpointError).code as unknown as string);
    }

    return (res as OcoOrder).orderReports
  }

  public static usdt2coin(usdt_amount: number, price: number): number {
    return usdt_amount / price
  }

  public static coin2usdt(coin_amount: number, price: number): number {
    return coin_amount * price
  }
}
