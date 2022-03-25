import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { WalletService } from './wallet.service';

@Resolver()
export class WalletResolver {
  constructor(private service: WalletService) {}

  @Mutation(() => String)
  walletApprove(
    @Args('spender') spender: string,
    @Args('amount') amount: number,
    @Args('currency_uid') currency_uid: string,
    @Args('prvKey') prvKey: string,
  ) {
    return this.service.approveContract(spender, amount, currency_uid, prvKey);
  }
}
