import { Test, TestingModule } from '@nestjs/testing';
import { SignalResolver } from './signal.resolver';

describe('SignalResolver', () => {
  let resolver: SignalResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignalResolver],
    }).compile();

    resolver = module.get<SignalResolver>(SignalResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
