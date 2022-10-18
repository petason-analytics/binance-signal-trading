import { Module } from '@nestjs/common';
import { PairInfoService } from './pair-info.service';
import { PairInfoResolver } from './pair-info.resolver';

@Module({
  providers: [PairInfoService, PairInfoResolver]
})
export class PairInfoModule {}
