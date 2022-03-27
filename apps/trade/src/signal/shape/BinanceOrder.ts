import BigNumber from "bignumber.js";
import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";

type Price = BigNumber;


export enum BinanceTradeType {
  BuyMarket = "BuyMarket",
  BuyLimit = "BuyLimit",
  BuyStop = "BuyStop",
  SellMarket = "SellMarket",
  SellLimit = "SellLimit",
  SellStop = "SellStop",
}
registerEnumType(BinanceTradeType, { name: "BinanceTradeType" });

export type BinanceOrder = {
  trade_type: BinanceTradeType,
  symbol: string,
  entry: Price,
  created_at: Date,
}

@ObjectType()
export class BinanceOrderObject implements BinanceOrder {
  @Field(() => Date)
  created_at: Date;
  @Field(() => String)
  entry: Price;
  @Field(() => String)
  symbol: string;
  @Field(() => BinanceTradeType)
  trade_type: BinanceTradeType;
}

@InputType()
export class BinanceOrderInput implements BinanceOrder {
  @Field(() => Date)
  created_at: Date;
  @Field(() => String)
  entry: Price;
  @Field(() => String)
  symbol: string;
  @Field(() => BinanceTradeType)
  trade_type: BinanceTradeType;
}
