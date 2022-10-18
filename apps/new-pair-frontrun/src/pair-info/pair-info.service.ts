import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as LRUCache from 'lru-cache';
import { Spot } from '@binance/connector';

import { WsClient } from "@lib/helper/service/socket-client.service";
import { AppError } from "@lib/helper/errors/base.error";
import { EventEmitter2 } from "@nestjs/event-emitter";
import BinanceTradingEndpoint, { BinanceTradingEndpointHelper } from "@lib/helper/binance/BinanceTradingEndpoint";
import { pseudoRandomBytes } from "crypto";

@Injectable()
export class PairInfoService {
  private readonly logger = new Logger(PairInfoService.name);

  private client: Spot;
  private enabledSymbols: Record<string, any> = {};

  // private pairThrottles: Record<string, any> = {};
  private pairThrottles = new LRUCache({
    max: 5,
  });

  private binanceTradingEndpoint: BinanceTradingEndpoint;

  // TODO: ActiveTradingPairs

  constructor(private eventEmitter: EventEmitter2) {
    this.binanceTradingEndpoint = BinanceTradingEndpoint.getInstance();
    this.client = new Spot('', '', {
      // wsURL: 'wss://testnet.binance.vision' // If optional base URL is not provided, wsURL defaults to wss://stream.binance.com:9443
    })
  }

  enablePair(base: string, quote: string) {
    this.subscribePairEvents(base, quote);
  }

  disablePair(base: string, quote: string) {
    this.unsubscribePairEvents(base, quote);
  }

  subscribePairEvents(base: string, quote: string) {
    const symbol = BinanceTradingEndpointHelper.get_binance_ws_symbol(base, quote);
    const callbacks = {
      open: () => this.logger.log("open stream: " + symbol),
      close: () => {
        this.logger.log("closed stream " + symbol);

        // Reconnect after 10s disconnected
        // TODO: Turn it on
        // setTimeout(() => {
        //   this.subscribePairEvents(base, quote);
        // },)
      },
      message: data => this.handlePairEvent(data),
    };
    const subscription = this.client.combinedStreams([`${symbol}@miniTicker`], callbacks);
    this.enabledSymbols[symbol] = subscription;
  }

  unsubscribePairEvents(base: string, quote: string) {
    const symbol = BinanceTradingEndpointHelper.get_binance_ws_symbol(base, quote);
    if (symbol in this.enabledSymbols) {
      const subscription = this.enabledSymbols[symbol];
      this.client.unsubscribe(subscription);
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
   * @param data
   */
  async handlePairEvent(data: any) {
    this.logger.debug('>> {handlePairEvent} : ', data);
    if (!this.shouldHandlePair(data)) {
      return;
    }

    this.logger.debug('{handlePairEvent} : ', data);
    this.updateOrCreateWithThrottle(data);
  }


  /**
   * Update or create pair with throttler
   * It only applies for each single pair
   */
  updateOrCreateWithThrottle(p: any) {
    // TODO:
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

  shouldHandlePair(pair: string): boolean {
    // TODO:
    return false;
  }
}
