import { Module } from '@nestjs/common';

import { PubsubService } from './pubsub.service';

@Module({
  providers: [PubsubService],
})
export class PubsubModule {}
