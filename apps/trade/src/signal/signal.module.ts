import { Module } from '@nestjs/common';
import { SignalResolver } from './signal.resolver';
import { SignalService } from './signal.service';

@Module({
  providers: [SignalResolver, SignalService]
})
export class SignalModule {}
