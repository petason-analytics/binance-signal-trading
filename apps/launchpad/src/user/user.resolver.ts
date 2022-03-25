import {
  AppAuthUser,
  CurrentUser,
} from '@lib/helper/decorator/current_user.decorator';
import { AppError } from '@lib/helper/errors/base.error';
import { EmailPipe } from '@lib/helper/pipe/email.pipe';
import { UserProfile } from '@lib/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile.model';
import { User } from '@lib/prisma/@generated/prisma-nestjs-graphql/user/user.model';
import { UserGraphql } from '@lib/prisma/type/user.type';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../../../../libs/helper/src/guards/auth.guard';
import { UserService } from './user.service';
import { ProfileUpdateInput } from './user.type';

@Resolver()
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => UserGraphql, { nullable: true })
  async me(@CurrentUser() user: AppAuthUser): Promise<any> {
    if (!user.id) {
      throw new AppError('Bad request');
    }
    return this.userService.user({ id: user.id }, true);
  }

  // Mutation

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UserProfile, { nullable: true })
  async updateProfile(
    @CurrentUser() user: AppAuthUser,
    @Args('data') data: ProfileUpdateInput,
  ): Promise<any> {
    return this.userService.updateProfile(user.id, data);
  }

  // @UseGuards(GqlAuthGuard)
  // @Mutation(() => User, { nullable: true })
  // async verifyEmail(
  //   @CurrentUser() user: AppAuthUser,
  //   @Args('email', EmailPipe)
  //   email: string,
  // ): Promise<any> {
  //   return this.userService.verifyEmail(user.id, email);
  // }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true })
  async verifyEmail(
    @CurrentUser() user: AppAuthUser,
    @Args('email', EmailPipe)
    email: string,
  ): Promise<boolean> {
    return this.userService.verifyEmail(user.id, email);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean, { nullable: true })
  async updateEmail(
    @CurrentUser() user: AppAuthUser,
    @Args('email', EmailPipe)
    email: string,
  ): Promise<boolean> {
    return this.userService.updateEmail(user.id, email);
  }
}
