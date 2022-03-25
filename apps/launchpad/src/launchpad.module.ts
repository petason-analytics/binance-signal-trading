import { CacheModule, Module } from '@nestjs/common';
import { LaunchpadController } from './launchpad.controller';
import { LaunchpadService } from './launchpad.service';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { BoxCampaignModule } from './box-campaign/box-campaign.module';
import { PrismaModule } from '@lib/prisma';
import { EmailModule } from './email/email.module';
import { TaskModule } from './task/task.module';
import { PubsubModule } from './pubsub/pubsub.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // NOTE: PROXY Careful to setup some more your app behind a PROXY,
    // https://docs.nestjs.com/security/rate-limiting#proxies
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 200,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          debug: configService.get('NODE_ENV') !== 'production',
          playground: configService.get('NODE_ENV') !== 'production',
          autoSchemaFile: process.cwd() + '/apps/launchpad/src/schema.gql',
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': false,
          },
        };
      },
    }),
    CacheModule.register({ isGlobal: true, ttl: 5 * 60 }),
    ScheduleModule.forRoot(),
    PrismaModule,
    // UserModule,
    // AuthModule,
    // RedisModule,
    // BoxCampaignModule,
    // EmailModule,
    // TaskModule,
    // PubsubModule,
  ],
  controllers: [LaunchpadController],
  providers: [LaunchpadService],
})
export class LaunchpadModule {}
