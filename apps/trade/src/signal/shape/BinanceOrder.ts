import BigNumber from "bignumber.js";
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { mapObject } from "@lib/helper/object.helper";
import { Order as BinanceOrderResponse } from "binance-api-node";
import { AppError } from "@lib/helper/errors/base.error";

type Price = BigNumber;


export enum BinanceTradeType {
  BuyMarket = "BuyMarket",
  BuyLimit = "BuyLimit",
  BuyStop = "BuyStop",
  BuyOcoStop = "BuyOcoStop",
  BuyOcoLimit = "BuyOcoLimit",
  SellMarket = "SellMarket",
  SellLimit = "SellLimit",
  SellStop = "SellStop",
  SellOcoStop = "SellOcoStop",
  SellOcoLimit = "SellOcoLimit",
}
registerEnumType(BinanceTradeType, { name: "BinanceTradeType" });

export const getBinanceTradeType = (item: BinanceOrderResponse): BinanceTradeType => {
  if (item.side == "BUY" && item.type == "LIMIT") {
    return BinanceTradeType.BuyLimit
  }
  else if (item.side == "BUY" && item.type == "MARKET") {
    return BinanceTradeType.BuyMarket
  }
  else if (item.side == "BUY" && item.type == "STOP") {
    return BinanceTradeType.BuyStop
  }
  else if (item.side == "BUY" && item.type == "STOP_LOSS_LIMIT") {
    return BinanceTradeType.BuyOcoStop
  }
  else if (item.side == "BUY" && item.type == "LIMIT_MAKER") {
    return BinanceTradeType.BuyOcoLimit
  }
  if (item.side == "SELL" && item.type == "LIMIT") {
    return BinanceTradeType.SellLimit
  }
  else if (item.side == "SELL" && item.type == "MARKET") {
    return BinanceTradeType.SellMarket
  }
  else if (item.side == "SELL" && item.type == "STOP") {
    return BinanceTradeType.SellStop
  }
  else if (item.side == "SELL" && item.type == "STOP_LOSS_LIMIT") {
    return BinanceTradeType.SellOcoStop
  }
  else if (item.side == "SELL" && item.type == "LIMIT_MAKER") {
    return BinanceTradeType.SellOcoLimit
  }
  else {
    throw new AppError(`Does not handled type: ${item.side} ${item.type}`);
  }
}

/*
Get this data from:
https://www.binance.com/en/trade-rule

extractBinanceTradingRule(2)
 */
export const BinanceMinAmountMovement = {
  "BTCUSDT": 0.00001,
  "ETHUSDT": 0.0001,
  "BNBUSDT": 0.001,
  "NEOUSDT": 0.01,
  "LTCUSDT": 0.001,
  "QTUMUSDT": 0.1,
  "ADAUSDT": 0.1,
  "XRPUSDT": 1,
  "EOSUSDT": 0.1,
  "TUSDUSDT": 1,
  "IOTAUSDT": 1,
  "XLMUSDT": 1,
  "ONTUSDT": 1,
  "TRXUSDT": 0.1,
  "ETCUSDT": 0.01,

  "ICXUSDT": 0.1,
  "NULSUSDT": 1,
  "VETUSDT": 0.1,
  "USDCUSDT": 1,
  "LINKUSDT": 0.01,
  "WAVESUSDT": 0.01,
  "ONGUSDT": 1,
  "HOTUSDT": 1,
  "ZILUSDT": 0.1,
  "ZRXUSDT": 1,
  "FETUSDT": 1,
  "BATUSDT": 1,
  "XMRUSDT": 0.001,
  "ZECUSDT": 0.001,
  "IOSTUSDT": 1,

  "CELRUSDT": 0.1,
  "DASHUSDT": 0.001,
  "OMGUSDT": 0.1,
  "THETAUSDT": 0.1,
  "ENJUSDT": 0.1,
  "MITHUSDT": 0.1,
  "MATICUSDT": 0.1,
  "ATOMUSDT": 0.01,
  "TFUELUSDT": 1,
  "ONEUSDT": 0.1,
  "FTMUSDT": 1,
  "ALGOUSDT": 1,
  "GTOUSDT": 0.1,
  "DOGEUSDT": 1,
  "DUSKUSDT": 1,

  "ANKRUSDT": 0.1,
  "WINUSDT": 1,
  "COSUSDT": 0.1,
  "COCOSUSDT": 1,
  "MTLUSDT": 0.1,
  "TOMOUSDT": 0.1,
  "PERLUSDT": 0.1,
  "DENTUSDT": 1,
  "MFTUSDT": 1,
  "KEYUSDT": 1,
  "DOCKUSDT": 1,
  "WANUSDT": 1,
  "FUNUSDT": 1,
  "CVCUSDT": 1,
  "CHZUSDT": 1,

  "BANDUSDT": 0.1,
  "BUSDUSDT": 1,
  "BEAMUSDT": 1,
  "XTZUSDT": 0.1,
  "RENUSDT": 1,
  "RVNUSDT": 0.1,
  "HBARUSDT": 1,
  "NKNUSDT": 1,
  "STXUSDT": 0.1,
  "KAVAUSDT": 0.1,
  "ARPAUSDT": 0.1,
  "IOTXUSDT": 1,
  "RLCUSDT": 0.1,
  "CTXCUSDT": 1,
  "BCHUSDT": 0.001,

  "TROYUSDT": 1,
  "VITEUSDT": 0.1,
  "FTTUSDT": 0.01,
  "EURUSDT": 0.1,
  "OGNUSDT": 1,
  "DREPUSDT": 1,
  "TCTUSDT": 1,
  "WRXUSDT": 0.1,
  "BTSUSDT": 0.1,
  "LSKUSDT": 0.1,
  "BNTUSDT": 0.1,
  "LTOUSDT": 1,
  "AIONUSDT": 1,
  "MBLUSDT": 1,
  "COTIUSDT": 1,

  "STPTUSDT": 0.1,
  "WTCUSDT": 1,
  "DATAUSDT": 0.1,
  "SOLUSDT": 0.01,
  "CTSIUSDT": 1,
  "HIVEUSDT": 1,
  "CHRUSDT": 1,
  "BTCUPUSDT": 0.01,
  "BTCDOWNUSDT": 0.01,
  "GXSUSDT": 1,
  "ARDRUSDT": 1,
  "MDTUSDT": 0.1,
  "STMXUSDT": 1,
  "KNCUSDT": 0.1,
  "REPUSDT": 0.01,

  "LRCUSDT": 1,
  "PNTUSDT": 1,
  "COMPUSDT": 0.001,
  "SCUSDT": 1,
  "ZENUSDT": 0.01,
  "SNXUSDT": 0.1,
  "ETHUPUSDT": 0.01,
  "ETHDOWNUSDT": 0.01,
  "ADAUPUSDT": 0.01,
  "ADADOWNUSDT": 0.01,
  "LINKUPUSDT": 0.01,
  "LINKDOWNUSDT": 0.01,
  "VTHOUSDT": 1,
  "DGBUSDT": 0.1,
  "GBPUSDT": 0.1,

  "SXPUSDT": 0.1,
  "MKRUSDT": 0.0001,
  "DCRUSDT": 0.001,
  "STORJUSDT": 1,
  "BNBUPUSDT": 0.01,
  "BNBDOWNUSDT": 0.01,
  "MANAUSDT": 1,
  "AUDUSDT": 1,
  "YFIUSDT": 0.00001,
  "BALUSDT": 0.01,
  "BLZUSDT": 1,
  "IRISUSDT": 0.1,
  "KMDUSDT": 1,
  "JSTUSDT": 0.1,
  "SRMUSDT": 0.1,

  "ANTUSDT": 0.1,
  "CRVUSDT": 0.1,
  "SANDUSDT": 1,
  "OCEANUSDT": 1,
  "NMRUSDT": 0.01,
  "DOTUSDT": 0.01,
  "LUNAUSDT": 0.01,
  "RSRUSDT": 0.1,
  "PAXGUSDT": 0.0001,
  "WNXMUSDT": 0.01,
  "TRBUSDT": 0.01,
  "SUSHIUSDT": 0.1,
  "YFIIUSDT": 0.0001,
  "KSMUSDT": 0.001,
  "EGLDUSDT": 0.01,

  "DIAUSDT": 0.1,
  "RUNEUSDT": 0.1,
  "FIOUSDT": 1,
  "UMAUSDT": 0.1,
  "TRXUPUSDT": 0.01,
  "TRXDOWNUSDT": 0.01,
  "XRPUPUSDT": 0.01,
  "XRPDOWNUSDT": 0.01,
  "DOTUPUSDT": 0.01,
  "DOTDOWNUSDT": 0.01,
  "BELUSDT": 0.1,
  "WINGUSDT": 0.01,
  "UNIUSDT": 0.01,
  "NBSUSDT": 0.1,
  "OXTUSDT": 1,

  "SUNUSDT": 1,
  "AVAXUSDT": 0.01,
  "HNTUSDT": 0.01,
  "FLMUSDT": 1,
  "ORNUSDT": 0.1,
  "UTKUSDT": 1,
  "XVSUSDT": 0.01,
  "ALPHAUSDT": 1,
  "AAVEUSDT": 0.001,
  "NEARUSDT": 0.1,
  "FILUSDT": 0.01,
  "INJUSDT": 0.1,
  "AUDIOUSDT": 0.1,
  "CTKUSDT": 0.1,
  "AKROUSDT": 1,

  "AXSUSDT": 0.01,
  "HARDUSDT": 1,
  "DNTUSDT": 1,
  "STRAXUSDT": 0.1,
  "UNFIUSDT": 0.1,
  "ROSEUSDT": 0.1,
  "AVAUSDT": 0.1,
  "XEMUSDT": 1,
  "SKLUSDT": 1,
  "SUSDUSDT": 0.1,
  "GRTUSDT": 1,
  "JUVUSDT": 0.01,
  "PSGUSDT": 0.01,
  "1INCHUSDT": 0.1,
  "REEFUSDT": 1,

  "OGUSDT": 0.1,
  "ATMUSDT": 0.01,
  "ASRUSDT": 0.1,
  "CELOUSDT": 0.1,
  "RIFUSDT": 1,
  "BTCSTUSDT": 0.01,
  "TRUUSDT": 1,
  "CKBUSDT": 1,
  "TWTUSDT": 1,
  "FIROUSDT": 0.1,
  "LITUSDT": 0.1,
  "SFPUSDT": 1,
  "DODOUSDT": 0.1,
  "CAKEUSDT": 0.01,
  "ACMUSDT": 0.1,

  "BADGERUSDT": 0.01,
  "FISUSDT": 1,
  "OMUSDT": 1,
  "PONDUSDT": 0.01,
  "DEGOUSDT": 0.01,
  "ALICEUSDT": 0.01,
  "LINAUSDT": 0.01,
  "PERPUSDT": 0.01,
  "RAMPUSDT": 1,
  "SUPERUSDT": 1,
  "CFXUSDT": 1,
  "EPSUSDT": 1,
  "AUTOUSDT": 0.001,
  "TKOUSDT": 0.1,
  "PUNDIXUSDT": 0.1,

  "TLMUSDT": 1,
  "BTGUSDT": 0.01,
  "MIRUSDT": 0.1,
  "BARUSDT": 0.01,
  "FORTHUSDT": 0.01,
  "BAKEUSDT": 0.1,
  "BURGERUSDT": 0.1,
  "SLPUSDT": 1,
  "SHIBUSDT": 1,
  "ICPUSDT": 0.01,
  "ARUSDT": 0.01,
  "POLSUSDT": 0.1,
  "MDXUSDT": 0.1,
  "MASKUSDT": 0.1,
  "LPTUSDT": 0.01,

  "XVGUSDT": 1,
  "ATAUSDT": 1,
  "GTCUSDT": 0.1,
  "TORNUSDT": 0.01,
  "ERNUSDT": 0.1,
  "KLAYUSDT": 0.1,
  "PHAUSDT": 1,
  "BONDUSDT": 0.01,
  "MLNUSDT": 0.001,
  "DEXEUSDT": 0.01,
  "C98USDT": 0.1,
  "CLVUSDT": 0.1,
  "QNTUSDT": 0.001,
  "FLOWUSDT": 0.01,
  "TVKUSDT": 1,

  "MINAUSDT": 0.1,
  "RAYUSDT": 0.1,
  "FARMUSDT": 0.001,
  "ALPACAUSDT": 0.1,
  "QUICKUSDT": 0.001,
  "MBOXUSDT": 0.1,
  "FORUSDT": 1,
  "REQUSDT": 1,
  "GHSTUSDT": 0.1,
  "WAXPUSDT": 1,
  "TRIBEUSDT": 1,
  "GNOUSDT": 0.001,
  "XECUSDT": 1,
  "ELFUSDT": 0.1,
  "DYDXUSDT": 0.01,

  "POLYUSDT": 0.1,
  "IDEXUSDT": 0.1,
  "VIDTUSDT": 0.1,
  "USDPUSDT": 0.01,
  "GALAUSDT": 1,
  "ILVUSDT": 0.001,
  "YGGUSDT": 0.1,
  "SYSUSDT": 1,
  "DFUSDT": 1,
  "FIDAUSDT": 0.1,
  "FRONTUSDT": 1,
  "CVPUSDT": 0.1,
  "AGLDUSDT": 0.1,
  "RADUSDT": 0.1,
  "BETAUSDT": 1,

  "RAREUSDT": 0.1,
  "LAZIOUSDT": 0.01,
  "CHESSUSDT": 0.1,
  "ADXUSDT": 1,
  "AUCTIONUSDT": 0.01,
  "DARUSDT": 1,
  "BNXUSDT": 0.001,
  "MOVRUSDT": 0.001,
  "CITYUSDT": 0.01,
  "ENSUSDT": 0.01,
  "KP3RUSDT": 0.01,
  "QIUSDT": 1,
  "PORTOUSDT": 0.01,
  "POWRUSDT": 1,
  "VGXUSDT": 0.1,

  "JASMYUSDT": 0.1,
  "AMPUSDT": 1,
  "PLAUSDT": 0.01,
  "PYRUSDT": 0.001,
  "RNDRUSDT": 0.01,
  "ALCXUSDT": 0.0001,
  "SANTOSUSDT": 0.01,
  "MCUSDT": 0.01,
  "ANYUSDT": 0.01,
  "BICOUSDT": 0.01,
  "FLUXUSDT": 0.01,
  "FXSUSDT": 0.1,
  "VOXELUSDT": 0.1,
  "HIGHUSDT": 0.001,
  "CVXUSDT": 0.001,

  "PEOPLEUSDT": 0.1,
  "OOKIUSDT": 1,
  "SPELLUSDT": 1,
  "USTUSDT": 1,
  "JOEUSDT": 0.01,
  "ACHUSDT": 1,
  "IMXUSDT": 0.01,
  "GLMRUSDT": 0.1,
  "LOKAUSDT": 0.1,
  "SCRTUSDT": 0.1,
  "API3USDT": 0.01,
  "BTTCUSDT": 1,
  "ACAUSDT": 0.01,
  "ANCUSDT": 0.01,
  "XNOUSDT": 0.01,

  "WOOUSDT": 0.1,
  "ALPINEUSDT": 0.01,
  "TUSDT": 0.1,
  "ASTRUSDT": 0.1,
  "GMTUSDT": 0.1,
  "KDAUSDT": 0.01,
  "APEUSDT": 0.01,
  "BSWUSDT": 0.1,
}

export const BinanceAmountMaxDecimal = mapObject(BinanceMinAmountMovement, (min_amount) => {
  return Math.floor(Math.abs(Math.log10(min_amount)));
})

function extractBinanceTradingRule(value_col_index) {
  const map = {}

  const table = document.querySelector("main div.trade-table > div.rc-table.rc-table-scroll-horizontal table tbody");
  const rows = table.querySelectorAll("tr");
  for (let i = 1, c = rows.length; i < c; i++) {
    const row = rows[i];
    const cols = row.querySelectorAll("td");

    const symbol_el = cols[0];
    const value_el = cols[value_col_index];

    const symbol = symbol_el.innerText.trim().replace("/", "");
    const value = parseFloat(value_el.innerText);

    map[symbol] = value;
  }

  return map;
}

export type BinanceOrder = {
  id?: number,
  trade_type: BinanceTradeType,
  symbol: string,
  amount: Price,
  amount_usd?: Price,
  entry: Price,
}

@ObjectType()
export class BinanceOrderObject implements BinanceOrder {
  @Field(() => String)
  amount: Price;
  @Field(() => String)
  entry: Price;
  @Field(() => String)
  symbol: string;
  @Field(() => BinanceTradeType)
  trade_type: BinanceTradeType;
}

@InputType()
export class BinanceOrderInput implements BinanceOrder {
  @Field(() => String)
  amount: Price;
  @Field(() => String)
  entry: Price;
  @Field(() => String)
  symbol: string;
  @Field(() => BinanceTradeType)
  trade_type: BinanceTradeType;

  // from(o: BinanceOrder) {
  //   this.amount = o.amount
  // }
}
