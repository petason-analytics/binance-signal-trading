import { ObjectType, OmitType } from '@nestjs/graphql';
import { User } from '../@generated/prisma-nestjs-graphql/user/user.model';

@ObjectType()
export class UserGraphql extends OmitType(User, ['password'] as const) {}
