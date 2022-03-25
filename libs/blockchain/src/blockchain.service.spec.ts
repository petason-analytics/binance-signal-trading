import { PrismaService } from '@lib/prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';

describe('BlockchainService', () => {
  let service: BlockchainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainService],
    })
      .useMocker((token) => {
        // console.log('token: ', token);
        return new PrismaService();
      })
      .compile();

    service = module.get<BlockchainService>(BlockchainService);
  });

  describe('Blockchain connect', () => {
    it('should approve success', async () => {
      const result = await service.approve(
        '0x5B2447Df55372321A3bBf7eDEAdEA866ff5de95D',
        200,
        'busd',
        '0x1d1a1bc6efe2b01d7a4d32ee46b21ffdf1453e945239dde6debfc74e1dc10e58',
      );
      await result.wait();
      // console.log('approve:', result);
      expect(
        await service.getAllowance(
          '0x6105321275E76Ac25152f86e0b1C8b23c06Bb199',
          '0x5B2447Df55372321A3bBf7eDEAdEA866ff5de95D',
          'busd',
        ),
      ).toEqual(200);
    }, 60000);

    // it('should return tx detail', async () => {
    //   const result = await service.getTransaction(
    //     '0x52e8cf870a2907c447b46d511bda0efee04b97d995fed02e67b39f3d1f3df6d6',
    //     'BSC',
    //   );
    //   console.log('getTransaction:', result);
    //   expect(result.transactionHash).toEqual(
    //     '0x52e8cf870a2907c447b46d511bda0efee04b97d995fed02e67b39f3d1f3df6d6',
    //   );
    // });

    // it('should return balance >= 0', async () => {
    //   const result = await service.getBalance(
    //     '0x948d6D28D396Eae2F8c3459b092a85268B1bD96B',
    //     'BSC',
    //   );
    //   console.log('getBalance:', result);
    //   expect(result).toBeGreaterThanOrEqual(0);
    // });

    // it('should return number >= 0', async () => {
    //   const result = await service.getAllowance(
    //     '0x53b3FF62adF9ECfD5b8084866D40aEc1314cE298',
    //     '0xab312737c18dbffcb55dea515c806e811f94945e',
    //     'bsc',
    //     'usdt',
    //   );
    //   console.log('getAllowance:', result);
    //   expect(result).toBeGreaterThanOrEqual(0);
    // });
  });
});
