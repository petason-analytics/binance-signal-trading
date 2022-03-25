import { BlockchainModule, BlockchainService } from '@lib/blockchain';
import { PrismaModule, PrismaService } from '@lib/prisma';
import { CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { BoxCampaignService } from './box-campaign.service';

describe('BoxCampaignService', () => {
  let service: BoxCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoxCampaignService],
      imports: [
        CacheModule.register({ isGlobal: true }),
        BlockchainModule,
        UserModule,
        PrismaModule,
      ],
    }).compile();

    service = module.get<BoxCampaignService>(BoxCampaignService);
  });

  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });

  // it('should return balance >= 0', async () => {
  //   const result = await service._enoughBalance(7, 3, '90', 'busd');
  //   console.log('result:', result);
  //   expect(result).toEqual(true);
  // });

  it('should buy box succeed', async () => {
    const result = await service.buyBox({
      box_price_uid: 'cl02lyae80023doo0hog0ssxf',
      quantity: 5,
      round_id: 2,
      user_id: 1,
    });
    console.log('result:', result);
    expect(result).toEqual(true);
  }, 6000);
});
