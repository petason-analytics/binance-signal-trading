import BigNumber from "bignumber.js";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Type } from '@nestjs/common';
import { UserGraphql } from "@lib/prisma";
import { User } from "@prisma/client";


export enum TradeType {
  Buy = "Buy",
  Sell = "Sell",
}

registerEnumType(TradeType, { name: "TradeType" });

export type Price = BigNumber;

export type Signal = {
  symbol: string,
  created_at: Date,
  trade_type: TradeType,
  entry: Price,
  sl: Price,
  tp1: Price,
  tp2?: Price,
  tp3?: Price,
  tp4?: Price,
  tp5?: Price,
}

@ObjectType()
export class SignalGraphql implements Signal {
  @Field(() => String)
  symbol: string;
  @Field(() => Date)
  created_at: Date;
  @Field(() => TradeType)
  trade_type: TradeType;
  @Field(() => String)
  entry: Price;
  @Field(() => String)
  sl: Price;
  @Field(() => String)
  tp1: Price;
  @Field(() => String, { nullable: true })
  tp2: Price;
  @Field(() => String, { nullable: true })
  tp3: Price;
  @Field(() => String, { nullable: true })
  tp4: Price;
  @Field(() => String, { nullable: true })
  tp5: Price;
}
