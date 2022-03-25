import { Field, InputType, OmitType } from '@nestjs/graphql';
import { BoxCampaignCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign/box-campaign-create.input';
import { GBoxCampaignRoundInput } from '@lib/prisma';

@InputType()
export class GBoxCampaignCreateInput extends OmitType(BoxCampaignCreateInput, [
  'rounds',
  'status',
  'buyHistory',
  'whitelists',
] as const) {
  @Field(() => [GBoxCampaignRoundInput], { nullable: false })
  rounds?: any;
}
