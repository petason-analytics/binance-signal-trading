import { CacheModule, Module } from "@nestjs/common";
import { TradeController } from './trade.controller';
import { TradeService } from './trade.service';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver } from "@nestjs/apollo";
// import { ScheduleModule } from "@nestjs/schedule";
import { SignalModule } from './signal/signal.module';
import { OrderModule } from './order/order.module';

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
          autoSchemaFile: process.cwd() + '/apps/trade/src/schema.gql',
          // subscriptions: {
          //   'graphql-ws': true,
          //   'subscriptions-transport-ws': false,
          // },
        };
      },
    }),
    CacheModule.register({ isGlobal: true, ttl: 5 * 60 }),
    SignalModule,
    OrderModule,
    // ScheduleModule.forRoot(),
  ],
  controllers: [TradeController],
  providers: [TradeService],
})
export class TradeModule {}
