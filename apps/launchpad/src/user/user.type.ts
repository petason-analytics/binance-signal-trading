import { UserProfileUpdateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/user-profile/user-profile-update.input';
import { UserUpdateWithoutProfileInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/user/user-update-without-profile.input';
import { Field, InputType, OmitType, PickType } from '@nestjs/graphql';

@InputType()
export class UserUpdateInput extends PickType(UserUpdateWithoutProfileInput, [
  'email',
] as const) {}

@InputType()
export class UserUpdate {
  @Field(() => UserUpdateInput, { nullable: true })
  update?: UserUpdateInput;
}

@InputType()
export class ProfileUpdateInput extends OmitType(UserProfileUpdateInput, [
  'user',
] as const) {
  // @Field(() => UserUpdate, { nullable: true })
  // user?: UserUpdate;
}
