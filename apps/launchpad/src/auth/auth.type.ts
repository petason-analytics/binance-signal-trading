import { UserGraphql } from '@lib/prisma/type/user.type';
import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';

@ObjectType()
export class AuthGraphql {
  @Field(() => String, { nullable: false })
  'token': string;
  @Field(() => UserGraphql, { nullable: true })
  'user': User;
}
