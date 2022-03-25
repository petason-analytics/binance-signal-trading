import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import IORedis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  public readonly client: IORedis;

  constructor() {
    this.client = new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      keyPrefix: process.env.REDIS_KEY_PREFIX || '',
      db: 0,
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    this.client
      .on('connect', () => this.logger.log(`Connected`))
      .on('ready', () => this.logger.log(`Ready`))
      .on('error', (error) => this.logger.error(error))
      .on('close', () => this.logger.log(`Close connection`))
      .on('reconnecting', () => this.logger.log(`Reconnecting`))
      .on('+node', (data) => this.logger.log(`A new node is connected: `))
      .on('-node', (data) => this.logger.log(`A node is disconnected: `))
      .on('node error', (data) =>
        this.logger.error(`An error occurs when connecting to a node: `),
      )
      .on('end', () => this.logger.log(`End`));
  }

  async onModuleInit() {
    // await this.client.connect();
  }
}
