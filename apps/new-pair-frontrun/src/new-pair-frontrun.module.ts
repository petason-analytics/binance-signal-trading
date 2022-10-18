import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { NewPairFrontrunController } from './new-pair-frontrun.controller';
import { NewPairFrontrunService } from './new-pair-frontrun.service';
import { PairInfoModule } from './pair-info/pair-info.module';
import { NewPairFrontrunResolver } from './new-pair-frontrun.resolver';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot({
      verboseMemoryLeak: true,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      useFactory: async (configService: ConfigService) => {
        return {
          // debug: configService.get('NODE_ENV') !== 'production',
          // playground: configService.get('NODE_ENV') === 'production',
          debug: true,
          playground: true,
          introspection: true,
          autoSchemaFile: process.cwd() + '/src/schema.gql',
          subscriptions: {
            'graphql-ws': true,
            'subscriptions-transport-ws': false,
          },
        };
      },
    }),
    PairInfoModule,
  ],
  controllers: [NewPairFrontrunController],
  providers: [NewPairFrontrunService, NewPairFrontrunResolver],
})
export class NewPairFrontrunModule {}
