import { Test, TestingModule } from '@nestjs/testing';
import { PairInfoService } from './pair-info.service';

describe('PairInfoService', () => {
  let service: PairInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PairInfoService],
    }).compile();

    service = module.get<PairInfoService>(PairInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
