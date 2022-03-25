import { AclAction, AclGuard, AppAbility, CheckAcls } from '@lib/acl';
import { GqlAuthGuard } from '@lib/helper/guards/auth.guard';
import { BoxCampaign } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-campaign/box-campaign.model';
import { GameCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game-create.input';
import { GameUpdateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game-update.input';
import { Game } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game.model';
import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { GameService } from './game.service';

@Resolver()
export class GameResolver {
  constructor(private readonly gameService: GameService) {}

  @UseGuards(AclGuard)
  @CheckAcls((ability: AppAbility) => ability.can(AclAction.Create, Game))
  @UseGuards(GqlAuthGuard)
  @Mutation(() => Game)
  createGame(@Args('input') input: GameCreateInput) {
    return this.gameService.create(input);
  }

  @UseGuards(AclGuard)
  @CheckAcls((ability: AppAbility) => ability.can(AclAction.Read, Game))
  @UseGuards(GqlAuthGuard)
  @Query(() => [Game], { name: 'game' })
  findAll() {
    return this.gameService.findAll();
  }

  @Query(() => Game, { name: 'game' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.gameService.findOne(id);
  }

  @Mutation(() => Game)
  updateGame(@Args('updateGameInput') updateGameInput: GameUpdateInput) {
    return { uid: 'aaa' };
    // return this.gameService.update(updateGameInput.id, updateGameInput);
  }

  @Mutation(() => Game)
  removeGame(@Args('id', { type: () => Int }) id: number) {
    return this.gameService.remove(id);
  }
}
