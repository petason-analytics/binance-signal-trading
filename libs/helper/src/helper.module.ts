import { Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { BinanceModule } from './binance/binance.module';

@Module({
  providers: [HelperService],
  exports: [HelperService],
  imports: [BinanceModule],
})
export class HelperModule {}
