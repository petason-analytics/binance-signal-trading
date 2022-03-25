import {
  AppAuthUser,
  CurrentUser,
} from '@lib/helper/decorator/current_user.decorator';
import { GqlAuthGuard } from '@lib/helper/guards/auth.guard';
import { BoxCampaignWhereUniqueInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign/box-campaign-where-unique.input';
import { UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import {
  GBoxCampaign,
  GBoxCampaignBuyHistory,
  GBoxCampaignInclude,
  WhitelistStatus,
  GChain,
  NotificationStatus,
  GBoxType,
} from './dto/box-campaign.dto';
import { BoxCampaign } from '@prisma/client';
import { BoxCampaignService } from './box-campaign.service';
import { BuyBoxInput } from './dto/BuyBoxInput';
import { PubSub } from 'graphql-subscriptions';
import { BSubscriptionKey } from './box-campaign.type';
import { Cron, CronExpression } from '@nestjs/schedule';
const pubSub = new PubSub();
@Resolver(() => GBoxCampaign)
export class BoxCampaignResolver {
  constructor(private service: BoxCampaignService) {}

  @Query(() => [GBoxCampaign], { nullable: true })
  async spotlightBoxCampaign(): Promise<BoxCampaign[]> {
    return this.service.splotlightBoxCampaign();
  }

  @Query(() => [GBoxCampaign], { nullable: true })
  async upcomingBoxCampaign(): Promise<BoxCampaign[]> {
    return this.service.upcomingBoxCampaign();
  }

  @Query(() => [GBoxCampaign], { nullable: true })
  async openingBoxCampaign(): Promise<BoxCampaign[]> {
    return this.service.openingBoxCampaign();
  }
  @Query(() => [GBoxCampaign], { nullable: true })
  async closedBoxCampaign(): Promise<BoxCampaign[]> {
    return this.service.closedBoxCampaign();
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => Boolean, {
    nullable: true,
    description: 'Check current user joined whitelist',
  })
  async isInWhitelist(
    @CurrentUser() user: AppAuthUser,
    @Args('box_campaign_uid') box_campaign_uid: string,
  ): Promise<boolean> {
    return this.service.isInWhitelist(box_campaign_uid, user.id);
  }

  @Query(() => WhitelistStatus, {
    nullable: true,
    description: 'Check registered whitelist status',
  })
  async whitelistRegistered(
    @Args('box_campaign_uid')
    box_campaign_uid: string,
  ): Promise<WhitelistStatus> {
    return this.service.getRegisteredWhitelist(box_campaign_uid);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [GBoxCampaignBuyHistory], {
    nullable: true,
    description: 'Box campaign transaction',
  })
  async boxCampaignBuyHistories(
    @CurrentUser() user: AppAuthUser,
    @Args('include', { nullable: true }) include: GBoxCampaignInclude,
  ) {
    return this.service.buyBoxHistories(
      {
        user_id: user.id,
      },
      {
        box: {
          include,
        },
      },
    );
  }

  @Query(() => GBoxCampaign, {
    nullable: true,
    description: 'Box campaign transaction',
  })
  async campaignDetail(
    @Args('where') where: BoxCampaignWhereUniqueInput,
    @Args('include') include: GBoxCampaignInclude,
  ): Promise<BoxCampaign> {
    return this.service.campaignDetail(where, include);
  }

  @Query(() => Float)
  getAllowanceAmount(
    @Args('address') address: string,
    @Args('boxPriceUid') boxPriceUid: string,
  ): Promise<number> {
    return this.service.getAllowanceAmount(address, boxPriceUid);
  }

  @ResolveField()
  async chains(@Parent() boxCampaign: GBoxCampaign) {
    const _chains: { [key: string]: GChain } = {};
    for (const item of boxCampaign.boxTypes
      .flatMap((item) => item.prices)
      .flatMap((item) => item.currency)) {
      _chains[item.chain_symbol] = item.chain;
    }
    return Object.values(_chains);
  }

  //Mutation
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Register whitelist',
  })
  async registerWhitelist(
    @CurrentUser() user: AppAuthUser,
    @Args('box_campaign_uid') box_campaign_uid: string,
  ): Promise<boolean> {
    const [count, maxSize] = await this.service.registerWhitelist(
      box_campaign_uid,
      user.id,
    );
    pubSub.publish(BSubscriptionKey.whitelistRegisteredRecently, {
      [BSubscriptionKey.whitelistRegisteredRecently]: {
        registered: count,
        limit: maxSize,
        box_campaign_uid,
      },
    });

    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, {
    nullable: true,
    description: 'Buy box',
  })
  async buyBox(
    @CurrentUser() user: AppAuthUser,
    @Args('input') input: BuyBoxInput,
  ): Promise<boolean> {
    input.user_id = user.id;
    const [box_id, soldAmount, quantity, box_campaign_uid, boxType] =
      await this.service.buyBox(input);
    const recentlyBox = await this.service.recentlyBox(box_id);
    pubSub.publish(BSubscriptionKey.purchasedBox, {
      [BSubscriptionKey.purchasedBox]: boxType,
    });
    pubSub.publish(BSubscriptionKey.recentlyPurchasedBox, {
      [BSubscriptionKey.recentlyPurchasedBox]: recentlyBox,
    });
    return true;
  }

  @Subscription(() => WhitelistStatus, {
    name: BSubscriptionKey.whitelistRegisteredRecently,
    nullable: true,
    filter(payload, variables) {
      return (
        payload.whitelistRegisteredRecently.box_campaign_uid ===
        variables.box_campaign_uid
      );
    },
  })
  whitelistRegisteredRecently(
    @Args('box_campaign_uid') box_campaign_uid: string,
  ) {
    return pubSub.asyncIterator(BSubscriptionKey.whitelistRegisteredRecently);
  }

  @Subscription(() => GBoxType, {
    name: BSubscriptionKey.purchasedBox,
    nullable: true,
    filter(payload, variables) {
      return (
        payload.purchasedBox.box_campaign_uid === variables.box_campaign_uid
      );
    },
    description: 'Box type state change when box purchased',
  })
  purchasedBox(@Args('box_campaign_uid') box_campaign_uid: string) {
    return pubSub.asyncIterator(BSubscriptionKey.purchasedBox);
  }

  @Subscription(() => GBoxCampaignBuyHistory, {
    name: BSubscriptionKey.recentlyPurchasedBox,
    nullable: true,
    filter(payload, variables) {
      return (
        payload.recentlyPurchasedBox.box_campaign_uid ===
        variables.box_campaign_uid
      );
    },
  })
  recentlyPurchasedBox(@Args('box_campaign_uid') box_campaign_uid: string) {
    return pubSub.asyncIterator(BSubscriptionKey.recentlyPurchasedBox);
  }
}
