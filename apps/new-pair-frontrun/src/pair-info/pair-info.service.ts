import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as LRUCache from 'lru-cache';
import { Spot } from '@binance/connector';

import { WsClient } from "@lib/helper/service/socket-client.service";
import { AppError } from "@lib/helper/errors/base.error";
import { EventEmitter2 } from "@nestjs/event-emitter";
import BinanceTradingEndpoint, { BinanceTradingEndpointHelper } from "@lib/helper/binance/BinanceTradingEndpoint";
import { round } from "../../../../src/utils/number";
import BigNumber from "bignumber.js";
import { EndpointError, OrderInput } from "@lib/helper/binance/TradingEndpoint";
import { Order, Order as BinanceOrderResponse } from "binance-api-node";
import { SignalTrading } from "@lib/helper/binance/SignalTrading";

export interface MiniTickerApi {
  eventType: string
  eventTime: number
  symbol: string
  curDayClose: string
  open: string
  high: string
  low: string
  volume: string
  volumeQuote: string
}


/*
{
  "stream":"bnbusdt@miniTicker",
  "data":{"e":"24hrMiniTicker","E":1666113759832,"s":"BNBUSDT","c":"272.60000000","o":"275.00000000","h":"276.00000000","l":"271.10000000","v":"187390.46200000","q":"51326693.81410000"}
}
*/
type MiniTickerWs = {
  stream: string,
  data: MiniTickerDataWs,
}
type MiniTickerDataWs = {
  s: string // symbol
  E: number // eventTime
  e: number // eventType
  o: string
  h: string
  l: string
  c: string // curDayClose
  q: string // volumeQuote
  v: string // volume
}

type WsSymbol = string; // lowercase pair
type UpperCaseSymbol = string;

@Injectable()
export class PairInfoService {
  private readonly logger = new Logger(PairInfoService.name);

  private initialized = false;
  private client: Spot;

  private enabledSymbols: Record<WsSymbol, {
    ts: number,
    sub: number,
    money_alloc: number,
  }> = {};
  private listedSymbols: Record<UpperCaseSymbol, number> = {}; // <symbol, current_time>

  // private pairThrottles: Record<string, any> = {};
  // private pairThrottles = new LRUCache({
  //   max: 5,
  // });

  private binanceTradingEndpoint: BinanceTradingEndpoint;

  // TODO: ActiveTradingPairs

  constructor(private eventEmitter: EventEmitter2) {

  }

  init() {
    this.binanceTradingEndpoint = BinanceTradingEndpoint.getInstance();
    this.client = new Spot('', '', {
      // wsURL: 'wss://testnet.binance.vision' // If optional base URL is not provided, wsURL defaults to wss://stream.binance.com:9443
    })
  }

  enablePair(base: string, quote: string, moneyAlloc: number) {
    if (!this.initialized) {
      this.init();
      this.initialized = true;
    }

    this.subscribePairEvents(base, quote, moneyAlloc);
  }

  disablePair(base: string, quote: string) {
    if (!this.initialized) {
      this.init();
      this.initialized = true;
    }

    this.unsubscribePairEvents(base, quote);
  }

  subscribePairEvents(base: string, quote: string, moneyAlloc: number) {
    const symbol = BinanceTradingEndpointHelper.get_binance_ws_symbol(base, quote);
    const callbacks = {
      open: () => this.logger.log("open stream: " + symbol),
      close: () => {
        this.logger.log("closed stream: " + symbol);

        // Reconnect after 10s disconnected
        // close event does not fire when we unsubscribe
        // So we can retry without loop
        setTimeout(() => {
          this.subscribePairEvents(base, quote, moneyAlloc);
        }, 10000)
      },
      message: data => this.handlePairEvent(data),
    };
    const subscription = this.client.combinedStreams([`${symbol}@miniTicker`], callbacks);
    this.enabledSymbols[symbol] = {
      ts: Date.now(),
      sub: subscription,
      money_alloc: moneyAlloc,
    };
  }

  unsubscribePairEvents(base: string, quote: string) {
    const symbol = BinanceTradingEndpointHelper.get_binance_ws_symbol(base, quote);
    if (symbol in this.enabledSymbols) {
      const subscription = this.enabledSymbols[symbol];
      this.client.unsubscribe(subscription.sub);
      delete this.enabledSymbols[symbol];

      this.logger.log(`Pair DISABLED: ` + symbol);
    } else {
      this.logger.log(`Pair not enabled before: ` + symbol);
    }
  }

  async filterPairEvent(message: any) {
    console.log('{filterPairEvent} message: ', message);

    // TODO:

    // if (typeof message === 'string') {
    //   if (message === 'pong') {
    //     this.logger.log(message);
    //     return;
    //   }
    //
    //   let msg: DTResponseType;
    //   try {
    //     msg = JSON.parse(message);
    //   } catch (e) {
    //     this.logger.error('{filterPairEvent} e, message: ', e, message);
    //     return;
    //   }
    //
    //   if (false) {
    //     this.handlePairEvent(data.pair);
    //   } else {
    //     this.handleNativeCurrencyPrice(prices);
    //   }
    // }
  }

  /**
   * dextool fires update event sometime have creation sometime not,
   * @param stream
   */
  async handlePairEvent(stream: string) {
    // this.logger.debug('>> {handlePairEvent} : ', stream, typeof stream);
    if (typeof stream !== 'string') {
      this.logger.error('SKIP: handlePairEvent(stream) require stream as string');
      return;
    }

    const streamObj = JSON.parse(stream) as MiniTickerWs;

    if (!this.shouldHandlePair(streamObj)) {
      return;
    }

    // this.logger.debug('{handlePairEvent} : ', streamObj);
    // this.updateOrCreateWithThrottle(stream);
    // We don't need throttle because event interval from server is 1s already
    this.handleMiniTicker(streamObj);
  }


  /**
   * Update or create pair with throttler
   * It only applies for each single pair
   */
  updateOrCreateWithThrottle(p: any) {
    // let throttleExecutor;
    // const pairUniqueId = this.pairInfoService.getPairIdFromDtPair(p);
    // if (this.pairThrottles.has(pairUniqueId)) {
    //   // get executor
    //   throttleExecutor = this.pairThrottles.get(pairUniqueId);
    // } else {
    //   // create and cache the executor
    //   throttleExecutor = throttle((pair) => {
    //     this.pairInfoService.updateOrCreatePool(pair);
    //   }, 1000);
    //   this.pairThrottles.set(pairUniqueId, throttleExecutor);
    // }
    //
    // // run it
    // throttleExecutor(p);
  }

  shouldHandlePair(data: any): boolean {
    const symbol = data.data?.s?.toLowerCase() ?? '';
    return symbol in this.enabledSymbols;
  }

  handleMiniTicker(stream: MiniTickerWs) {
    const d = stream.data;
    const isListed = d.o; // has open price
    const symbol = d.s;
    if (isListed && !this.listedSymbols[symbol]) {
      this.listedSymbols[symbol] = Date.now(); // cache this
      this.onPairListed(d);
    } else {
      this.onPairUpdated(d)
    }
  }

  onPairListed(d: MiniTickerDataWs) {
    this.logger.log('{onPairListed} d: ', d);

    // Skip if pair have event come immediately
    const ageValidation = false; // NOTE: true on prod // TODO: true
    if (ageValidation) {
      const symbol = d.s;
      const enabledTs = this.enabledSymbols[symbol.toLowerCase()].ts;
      if (Date.now() - enabledTs <= 30 * 1000) {
        this.logger.error("{onPairListed} SKIP: event come " + `${round((Date.now() - enabledTs) / 1000, 2)}s so it's not safe for open trade, this pair might already listed a long time ago`);
        return;
      }
    }

    // open trade
    this.tryToBuy(d).catch(e => {
      this.logger.error('{tryToBuy} e: ', e);
    });
  }

  onPairUpdated(d: MiniTickerDataWs) {
    // console.log('{onPairUpdated} d: ', d);
    // TODO: Notice SL if it's possible
  }

  async tryToBuy(d: MiniTickerDataWs) {
    const symbol = d.s;

    const lotSizeFilter = await BinanceTradingEndpointHelper.get_lot_size_filter(symbol)
    const maxDecimal = BinanceTradingEndpointHelper.step_size_2_max_decimal(new BigNumber(lotSizeFilter.stepSize).toNumber());

    const totalMoneyAlloc = this.enabledSymbols[symbol.toLowerCase()].money_alloc;
    if (!totalMoneyAlloc) {
      this.logger.error(`{tryToBuy} No money alloc for this symbol: ${symbol}`)
      return;
    }

    const res: Order = await this.buyWithoutSetTp(symbol, d.c, totalMoneyAlloc, maxDecimal, false).catch(e => {
      this.logger.error(`{buyAndSetTp} e: `, e);
      return null;
    })
    if (!res) {
      return;
    }

    // success
    if (res.orderId) {
      await this.tryPlaceMultipleTP(res, symbol, maxDecimal);
    }
  }

  async buyWithoutSetTp(symbol: string, currentPrice: string, totalMoneyAlloc: number, maxDecimal: number, dry_run: boolean) {
    const amount = SignalTrading.usdt2coin(
      new BigNumber(totalMoneyAlloc).toNumber(),
      new BigNumber(currentPrice).toNumber()
    );
    const new_order: OrderInput = {
      symbol: symbol,
      side: "BUY", // BUY,SELL
      // @ts-ignore
      type: "MARKET", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
      quantity: new BigNumber(amount).decimalPlaces(maxDecimal).toString(),
      // price: order.entry.toString(),
      // newClientOrderId, // A unique id for the order. Automatically generated if not sent.
      newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
    };
    console.log('{buyWithoutSetTp} sending new_order: ', new_order);
    const res = await BinanceTradingEndpoint.getInstance().order(new_order, dry_run);
    console.log("{buyWithoutSetTp} res: ", res);
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

    const buyPrice = currentPrice;
    this.logger.log(`{buyWithoutSetTp} SUCCESS: Buy ${symbol} at ${buyPrice}.`);
    // Please sell it at price: ${tpTargetNum.toString()}

    return res
  }


  private async tryPlaceMultipleTP(res: Order, symbol: string, maxDecimal: number) {
    const qtty = new BigNumber(res.executedQty);
    const FEE_PERCENT = 0.5; // taker 0.075% => not work
    const ocoQtty = qtty.minus(qtty.multipliedBy(FEE_PERCENT / 100)); // real owned amount = primary_order.executedQtty - transaction fee + some other fee I dont know
    const realBoughtAmount = ocoQtty.toNumber();
    const amountUsdVsTp = [
      // [totalMoneyAlloc * 100 / 100, 2], // 50% x2
      [realBoughtAmount * 50 / 100, 2], // 50% x2
      [realBoughtAmount * 40 / 100, 4], // 40% x4
      [realBoughtAmount * 10 / 100, 8] // 10% x8
    ];

    const priceFilter = await BinanceTradingEndpointHelper.get_price_filter(symbol);
    const maxPriceDecimal = BinanceTradingEndpointHelper.step_size_2_max_decimal(new BigNumber(priceFilter.tickSize).toNumber());

    // place sell limit
    for (let i = 0, c = amountUsdVsTp.length; i < c; i++) {
      const [amountToken, tpTarget] = amountUsdVsTp[i];
      const new_order: OrderInput = {
        symbol: symbol,
        side: "SELL", // BUY,SELL
        // @ts-ignore
        type: "LIMIT", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
        quantity: new BigNumber(amountToken).decimalPlaces(maxDecimal).toString(),
        price: new BigNumber(tpTarget).decimalPlaces(maxPriceDecimal).toString(),
        // newClientOrderId, // A unique id for the order. Automatically generated if not sent.
        newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
      };
      console.log("{tryToTP} sending sell limit: ", new_order);

      try {
        const res = await BinanceTradingEndpoint.getInstance().order(new_order, false);
        this.logger.log("{tryToTP} tp_order: ", res);
      } catch (e) {
        this.logger.log("{tryToTP} e: ", e);
      }
    }
  }
}
