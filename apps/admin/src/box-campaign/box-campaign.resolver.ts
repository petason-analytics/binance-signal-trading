import {
  AclAction,
  AclGuard,
  AppAbility,
  CanAclGuard,
  CheckAcls,
  UseAcls,
} from '@lib/acl';
import { GqlAuthGuard } from '@lib/helper/guards/auth.guard';
import { BoxCampaign } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign/box-campaign.model';
import { BoxPriceCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-price/box-price-create.input';
import { BoxPrice } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-price/box-price.model';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GBoxCampaign } from 'apps/launchpad/src/box-campaign/dto/box-campaign.dto';
import { BoxCampaignService } from './box-campaign.service';
import { GBoxCampaignCreateInput } from './box-campaign.type';
import { GABoxPriceCreateInput } from './dto/box-campaign.dto';

@Resolver()
export class BoxCampaignResolver {
  constructor(private service: BoxCampaignService) {}

  @Query(() => GBoxCampaign)
  boxCampaign(@Args('uid') uid: string) {
    return this.service.boxCampaign(uid);
  }

  @UseGuards(AclGuard)
  @CheckAcls((ability: AppAbility) =>
    ability.can(AclAction.Create, BoxCampaign),
  )
  @UseGuards(GqlAuthGuard)
  @Mutation(() => GBoxCampaign)
  createBoxCampaign(@Args('input') input: GBoxCampaignCreateInput) {
    return this.service.createBoxCampaign(input);
  }

  // @UseGuards(CanAclGuard)
  // @UseAcls({ actions: [AclAction.Create], subject: BoxPrice })
  @UseGuards(GqlAuthGuard)
  @Mutation(() => BoxPrice)
  createBoxPrice(@Args('input') input: GABoxPriceCreateInput) {
    return this.service.createBoxPrice(input);
  }
}
