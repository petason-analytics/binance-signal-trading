import Binance, { Account, ErrorCodes, NewOrderSpot } from "binance-api-node";
import { EndpointError, OrderInput, OrderResponse, TradingEndpoint } from "@lib/helper/binance/TradingEndpoint";


class BinanceTradingEndpoint implements TradingEndpoint {
  private static instance: BinanceTradingEndpoint;

  public client;
  public usdt_balance;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    // env is loaded lazily, so we need to init client lazy also,
    // that's why we use this kind of singleton

    // Authenticated client, can make signed calls
    this.client = Binance({
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_API_SECRET
      // getTime: xxx,
    });

    this.it_work().then(worked => {
      if (worked) {
        console.log("{BinanceTradingEndpoint} Connected");
      } else {
        console.error("{BinanceTradingEndpoint} NOT Connected, Binance will not work!");
      }
    });

    this.fetch_balance("USDT").then(balance => {
      this.usdt_balance = balance;
    });
  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): BinanceTradingEndpoint {
    if (!BinanceTradingEndpoint.instance) {
      BinanceTradingEndpoint.instance = new BinanceTradingEndpoint();
    }

    return BinanceTradingEndpoint.instance;
  }

  async it_work(): Promise<boolean> {
    // https://github.com/binance-exchange/binance-api-node#time
    const time = await this.client.time();
    return time > 0;
  }

  has_usdt_balance() {
    return this.usdt_balance > 10; // min $10
  }

  async fetch_balance(symbol: string): Promise<number> {
    const account: Account = await this.client.accountInfo();

    for (let i = 0, c = account.balances.length; i < c; i++) {
      const item = account.balances[i];
      if (item.asset === symbol) {
        return parseFloat(item.free);
      }
    }

    return 0;
  }

  /**
   * https://github.com/binance-exchange/binance-api-node#order
   *
   * BuyLimit with price more than market => filled with market price
   */
  async order(order: OrderInput, dry_run: boolean): Promise<OrderResponse | EndpointError> {
    const new_order = this.orderInput2BinanceOrder(order);

    /*
    // success if null
    // else throw those errors:
    - MIN_NOTIONAL: min trading vol is $10
    - LOT_SIZE: invalid because size or decimal is redundant, eg: 150.2 TRX (~$10) is ok, but 150.2678 is invalid because to much digits
                this depend on each symbol
                Must follow the `Minimum Amount Movement` column: https://www.binance.com/en/trade-rule
     */

    if (!this.has_usdt_balance()) {
      return {
        code: ErrorCodes.UNKNOWN,
        message: 'Not enough USDT balance, this app require at least 10 USDT',
        e: "App error",
      }
    }

    if (dry_run) {
      const res = await this.client.orderTest(new_order);
      // never to this case because it will throw error instead
      return {
        code: ErrorCodes.UNKNOWN,
        message: 'success because orderTest does not return any output on success',
        e: "Some error",
      }
    } else {
      try {
        const res = await this.client.order(new_order);
        console.log("{BinanceTradingEndpoint.order} order res: ", res);
        return res as OrderResponse;
      } catch (e) {
        console.log('{BinanceTradingEndpoint.order} e: ', e);

        const error_code = this.getErrorCode(e);
        return {
          code: error_code,
          message: e.message,
          e: e,
        }
      }
    }
  }

  /**
   * Convert universal order into this endpoint Order
   */
  orderInput2BinanceOrder(order: OrderInput): NewOrderSpot {
    // const new_order = {
    //   symbol: "XLMETH",
    //   side: "BUY", // BUY,SELL
    //   type: "LIMIT", // LIMIT, MARKET, STOP, STOP_LOSS_LIMIT, STOP_LOSS_MARKET, TAKE_PROFIT, TAKE_PROFIT_MARKET,
    //   quantity: "100",
    //   price: "0.0002",
    //   // newClientOrderId, // A unique id for the order. Automatically generated if not sent.
    //   newOrderRespType: "RESULT" // Returns more complete info of the order. ACK, RESULT, or FULL
    // };
    return order as NewOrderSpot;
  }

  getErrorCode(e: any): ErrorCodes {
    return e.code
  }
}

export default BinanceTradingEndpoint;
