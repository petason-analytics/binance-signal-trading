import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Int, { nullable: true })
  userId: number;
}

@ObjectType()
export class EmailInput {
  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  campaign_name: string;
}

export enum EmailType {
  verifyEmail = 'verifyEmail',
  successfulTransaction = 'successfulTransaction',
  registerWhitelist = 'registerWhitelist',
  whitelistRegisterAfterOneDay = 'whitelistRegisterBeforeOneDay',
  whitelistRegisterAfter15Minutes = 'whitelistRegisterBefore15Minutes',
  whitelistOpenAfterOneDay = 'whitelistOpenBeforeOneDay',
  whitelistOpenAfter15Min = 'whitelistOpenBefore15Min',
  boxCampaignOpenAfterOneDay = 'boxCampaignOpenBeforeOneDay',
  boxCampaignOpenAfter15Minutes = 'boxCampaignOpenAfter15Minutes',
  campaignClose = 'campaignClose',
}
