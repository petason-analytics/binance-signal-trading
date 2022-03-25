import { AppError } from '@lib/helper/errors/base.error';
import { UserGraphql } from '@lib/prisma/type/user.type';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthGraphql, LoginInput, RegisterInput } from './auth.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthGraphql, {
    description: 'Admin login',
  })
  async login(@Args() input: LoginInput): Promise<any> {
    const result = await this.authService.login(input.email, input.password);
    return result;
  }

  @Mutation(() => UserGraphql, {
    description: 'Admin login',
  })
  async register(@Args() input: RegisterInput): Promise<any> {
    if (
      (process.env.ADMIN_REGISTER_ENABLE ?? 'false').toLowerCase() == 'false'
    ) {
      throw new AppError('REGISTER DISABLE');
    }
    const result = await this.authService.register(input.email, input.password);
    return result;
  }
}
