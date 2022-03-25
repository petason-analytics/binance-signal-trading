import { BoxPriceCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-price/box-price-create.input';
import { Field, Float, InputType, OmitType } from '@nestjs/graphql';

@InputType()
export class GABoxPriceCreateInput extends OmitType(BoxPriceCreateInput, [
  'price',
] as const) {
  @Field(() => Float, { nullable: true })
  price?: any;
}
