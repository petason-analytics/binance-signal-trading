import { BlockchainModule, BlockchainService } from '@lib/blockchain';
import { PrismaModule, PrismaService } from '@lib/prisma';
import { CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  const prisma = new PrismaService();
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskService],
      imports: [
        CacheModule.register({ isGlobal: true }),
        BlockchainModule,
        PrismaModule,
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // it('should change status', async () => {
  //   const result = await service.handlePendingBuyBox();
  //   console.log('result:', result);
  //   // expect(result).toBeGreaterThanOrEqual(0);
  // }, 20000);

  it('check confirming buybox without error', async () => {
    await service.handleConfirmingBuyBox();
  }, 20000);
});
