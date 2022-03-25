import { BoxContractCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-contract/box-contract-create.input';
import { BoxContract } from '@lib/prisma/@generated/prisma-nestjs-graphql/box-contract/box-contract.model';
import { InputType, ObjectType, OmitType } from '@nestjs/graphql';

@InputType()
export class GABoxContractCreateInput extends OmitType(BoxContractCreateInput, [
  'uid',
  'created_at',
  'updated_at',
  'is_transfered',
  'boxPrices',
] as const) {}

@ObjectType()
export class GABoxContract extends OmitType(BoxContract, [
  '_count',
  'admin_prv_key',
  'boxPrices',
  'chain',
  'owner',
] as const) {}
