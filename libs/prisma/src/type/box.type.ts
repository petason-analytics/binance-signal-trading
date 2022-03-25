import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

export interface BoxCampaignRound {
  id: number;
  name: string;
  description?: string;
  start: string;
  end: string;
  is_whitelist?: boolean;
  require_whitelist?: boolean;
  participant_limit?: number;
  box_limit_this_phase?: number;
}

export interface WhitelistNumber {
  count: number;
  name: string;
}

@ObjectType()
export class GBoxCampaignRound {
  @Field(() => Int, { nullable: false })
  'id': number;
  @Field(() => String, { nullable: false })
  'name': string;
  @Field(() => String, { nullable: true })
  'description': string;
  @Field(() => String, { nullable: false })
  'start': string;
  @Field(() => String, { nullable: false })
  'end': string;
  @Field(() => Boolean, { nullable: true })
  'is_whitelist': boolean;
  @Field(() => Boolean, { nullable: true })
  'require_whitelist': boolean;
  @Field(() => Int, { nullable: true, description: 'whitelist limit' })
  'participant_limit': number;
  @Field(() => Int, {
    nullable: true,
    description: 'Number of box can buy per phase, current not use',
  })
  'box_limit_this_phase': number;
}

@InputType()
export class GBoxCampaignRoundInput {
  @Field(() => Int, { nullable: false })
  'id': number;
  @Field(() => String, { nullable: false })
  'name': string;
  @Field(() => String, { nullable: true })
  'description': string;
  @Field(() => Date, { nullable: false })
  'start': string;
  @Field(() => Date, { nullable: false })
  'end': string;
  @Field(() => Boolean, { nullable: true })
  'is_whitelist': boolean;
  @Field(() => Boolean, { nullable: true })
  'require_whitelist': boolean;
  @Field(() => Int, { nullable: true, description: 'whitelist limit' })
  'participant_limit': number;
  @Field(() => Int, {
    nullable: true,
    description: 'Number of box can buy per phase, currently not use',
  })
  'box_limit_this_phase': number;
}
