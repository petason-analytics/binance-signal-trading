import { IsStrongPass } from '@lib/helper/pipe/password.pipe';
import { UserGraphql } from '@lib/prisma/type/user.type';
import { ArgsType, Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { IsEmail, Validate } from 'class-validator';

@ObjectType()
export class AuthGraphql {
  @Field(() => String, { nullable: false })
  'token': string;
  @Field(() => UserGraphql, { nullable: false })
  'user': User;
}

@ArgsType()
export class LoginInput {
  @Field(() => String, { nullable: false })
  @IsEmail()
  'email': string;

  @Field(() => String, { nullable: false })
  'password': string;
}

@ArgsType()
export class RegisterInput {
  @Field(() => String, { nullable: false })
  @IsEmail()
  'email': string;

  @Field(() => String, { nullable: false })
  @Validate(IsStrongPass)
  'password': string;
}
