import { Test, TestingModule } from '@nestjs/testing';
import { HelperService } from './helper.service';
import { randString } from './string.helper';

describe('HelperService', () => {
  let service: HelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelperService],
    }).compile();

    service = module.get<HelperService>(HelperService);
  });

  it('Random string only uper case and number with length 10 should success', () => {
    const result = randString(10);
    console.log('result: ', result);
    expect(result).toMatch(/[A-Z0-9]/);
  });
});
