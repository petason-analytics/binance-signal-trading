import { Field, InputType, Int } from '@nestjs/graphql';
import { BoxCampaignBuyHistoriesStatus } from '@prisma/client';
import { Min } from 'class-validator';

@InputType()
export class BuyBoxInput {
  @Field()
  box_price_uid: string;

  @Field(() => Int)
  round_id: number;

  @Field(() => Int)
  @Min(1)
  quantity: number;

  user_id: number;

  status?: BoxCampaignBuyHistoriesStatus;
}
