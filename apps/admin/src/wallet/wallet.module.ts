import { BlockchainModule } from '@lib/blockchain';
import { Module } from '@nestjs/common';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

@Module({
  providers: [WalletResolver, WalletService],
  imports: [BlockchainModule],
})
export class WalletModule {}
