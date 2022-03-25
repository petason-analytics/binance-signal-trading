import { Test, TestingModule } from '@nestjs/testing';
import { BoxCampaignService } from './box-campaign.service';

describe('BoxCampaignService', () => {
  let service: BoxCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoxCampaignService],
    }).compile();

    service = module.get<BoxCampaignService>(BoxCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
