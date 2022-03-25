import { BlockchainService } from '@lib/blockchain';
import { PrismaService } from '@lib/prisma';
import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { TaskService } from './task.service';

@Module({
  imports: [EmailModule],
  providers: [TaskService, BlockchainService, PrismaService],
  exports: [TaskService],
})
export class TaskModule {}
