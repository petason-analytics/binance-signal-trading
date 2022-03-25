import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthGraphql } from './auth.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => String, {
    description: 'Generate nonce for user login',
  })
  async generateNonce(@Args('address') address: string): Promise<string> {
    const result = await this.authService.getNonce(address);
    return result;
  }

  @Mutation(() => AuthGraphql, {
    description: 'User login',
  })
  async login(
    @Args('address') address: string,
    @Args('sign') sign: string,
  ): Promise<any> {
    const result = await this.authService.login(address, sign);
    return result;
  }
}
