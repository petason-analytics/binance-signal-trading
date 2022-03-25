import { PrismaModule } from '@lib/prisma';
import { ApolloDriver } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BoxCampaignModule } from './box-campaign/box-campaign.module';
import { GameModule } from './game/game.module';
import { AclModule } from '@lib/acl';
import { WalletModule } from './wallet/wallet.module';
import { ContractModule } from './contract/contract.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // NOTE: PROXY Careful to setup some more your app behind a PROXY,
    // https://docs.nestjs.com/security/rate-limiting#proxies
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 2,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        debug: configService.get('NODE_ENV') !== 'production',
        playground: configService.get('NODE_ENV') !== 'production',
        autoSchemaFile: process.cwd() + '/apps/admin/src/schema.gql',
        dateScalarMode: 'date',
      }),
    }),
    CacheModule.register({ isGlobal: true, ttl: 5 * 60 }),
    PrismaModule,
    AclModule,
    AuthModule,
    UserModule,
    BoxCampaignModule,
    GameModule,
    WalletModule,
    ContractModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
