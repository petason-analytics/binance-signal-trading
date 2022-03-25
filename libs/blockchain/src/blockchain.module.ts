import { PrismaModule } from '@lib/prisma';
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';

@Module({
  imports: [PrismaModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
