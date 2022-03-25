import { GBoxCampaignRound } from '@lib/prisma';
import { BoxCampaignBuyHistory } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign-buy-history/box-campaign-buy-history.model';
import { BoxCampaign } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign/box-campaign.model';
import { BoxContract } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-contract/box-contract.model';
import { BoxPrice } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-price/box-price.model';
import { BoxType } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-type/box-type.model';
import { Chain } from '@lib/prisma/@generated/prisma-nestjs-graphql/chain/chain.model';
import { Currency } from '@lib/prisma/@generated/prisma-nestjs-graphql/currency/currency.model';
import { Game } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game.model';
import { ChainSymbol } from '@lib/prisma/@generated/prisma-nestjs-graphql/prisma/chain-symbol.enum';
import { Field, InputType, Int, ObjectType, OmitType } from '@nestjs/graphql';

@ObjectType()
export class GChain extends OmitType(Chain, [
  '_count',
  'nftBox',
  'currencies',
  'chain_id',
  'rpc_url',
] as const) {}

@ObjectType()
export class GCurrency extends OmitType(Currency, [
  '_count',
  'boxPrices',
] as const) {}
@ObjectType()
export class GGame extends OmitType(Game, ['_count'] as const) {}

@ObjectType()
export class GBoxCampaign extends OmitType(BoxCampaign, [
  '_count',
  'buyHistory',
  'whitelists',
  'boxTypes',
  'game',
] as const) {
  @Field(() => [GBoxCampaignRound])
  'rounds': any;

  @Field(() => [GBoxType], { nullable: true })
  boxTypes?: Array<GBoxType>;

  @Field(() => GGame, { nullable: false })
  game?: GGame;

  @Field(() => [GChain], {
    description: 'get the chains which campaign supports',
  })
  chains: GChain;
}

@InputType()
export class GBoxCampaignInclude {
  @Field(() => Boolean, { nullable: true })
  game?: boolean;

  @Field(() => Boolean, { nullable: true })
  boxTypes?: boolean;

  @Field(() => Boolean, { nullable: true })
  boxPrices?: boolean;

  @Field(() => Boolean, { nullable: true })
  chain?: boolean;

  @Field(() => Boolean, { nullable: true })
  currency?: boolean;

  // @Field(() => Boolean, { nullable: true })
  // whitelists?: boolean;
}

@ObjectType()
export class GBoxCampaignBase extends OmitType(BoxCampaign, [
  'boxTypes',
  'whitelists',
  'buyHistory',
  '_count',
  'game',
] as const) {
  @Field(() => GGame, { nullable: false })
  game?: GGame;
}

@ObjectType()
export class GBoxContract extends OmitType(BoxContract, [
  '_count',
  'admin_prv_key',
  'admin_address',
  'boxPrices',
  'chain',
  'is_transfered',
  'owner',
] as const) {}

@ObjectType()
export class GBoxPrice extends OmitType(BoxPrice, [
  // 'chain',
  'currency',
  'contract',
] as const) {
  // @Field(() => GChain, { nullable: false })
  // chain?: GChain;

  @Field(() => GCurrency, { nullable: false })
  currency?: GCurrency;

  @Field(() => GBoxContract, { nullable: true })
  contract?: GBoxContract;
}

@ObjectType()
export class GBoxType extends OmitType(BoxType, [
  'campaign',
  '_count',
  'prices',
] as const) {
  @Field(() => [GBoxPrice], { nullable: true })
  prices?: Array<BoxPrice>;
}

@ObjectType()
export class GBoxTypeHistory extends OmitType(BoxType, [
  'prices',
  '_count',
  'campaign',
] as const) {}

@ObjectType()
export class GBoxPriceHistory extends OmitType(BoxPrice, [
  'boxType',
  'currency',
] as const) {
  @Field(() => ChainSymbol, { nullable: true })
  'chain_symbol': keyof typeof ChainSymbol;
  @Field(() => String, { nullable: true })
  'chain_icon': string;
  @Field(() => String, { nullable: true })
  'chain_name': string;
  @Field(() => String, { nullable: true })
  'currency_name': string;
  @Field(() => String, { nullable: true })
  'currency_icon': string;
  @Field(() => String, { nullable: true })
  'currency_symbol': string;
  @Field(() => GBoxTypeHistory, { nullable: true })
  'boxType': any;
}

@ObjectType()
export class GBoxCampaignBuyHistory extends OmitType(BoxCampaignBuyHistory, [
  'box_price',
  'box',
] as const) {
  @Field(() => GBoxCampaignBase)
  'box': any;
  @Field(() => GBoxPriceHistory, { nullable: true })
  'box_price': any;
}

@ObjectType()
export class WhitelistStatus {
  @Field(() => Int)
  'registered': number;

  @Field(() => Int)
  'limit': number;

  @Field(() => String)
  'box_campaign_uid': string;
}

@ObjectType()
export class PurchasedBoxStatus {
  @Field(() => Number)
  'total_amount': number;

  @Field(() => Number)
  'sold_amount': number;

  @Field(() => String)
  'box_campaign_uid': string;
}

@ObjectType()
export class NotificationStatus {
  @Field(() => Number)
  'user_id': number;

  @Field(() => String)
  'content': string;
}
