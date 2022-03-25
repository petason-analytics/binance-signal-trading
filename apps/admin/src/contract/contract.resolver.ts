import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContractService } from './contract.service';
import { GABoxContract, GABoxContractCreateInput } from './dto/contract.dto';

@Resolver()
export class ContractResolver {
  constructor(private service: ContractService) {}

  @Query(() => [GABoxContract])
  boxContracts() {
    return this.service.boxContracts();
  }

  @Mutation(() => GABoxContract)
  createBoxContract(@Args('input') input: GABoxContractCreateInput) {
    return this.service.createBoxContract(input);
  }
}
