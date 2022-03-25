import { Module } from '@nestjs/common';
import { ContractResolver } from './contract.resolver';
import { ContractService } from './contract.service';

@Module({
  providers: [ContractResolver, ContractService]
})
export class ContractModule {}
