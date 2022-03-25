import { Module } from '@nestjs/common';
import { BoxCampaignService } from './box-campaign.service';
import { BoxCampaignResolver } from './box-campaign.resolver';
import { UserModule } from '../user/user.module';
import { BlockchainModule } from '@lib/blockchain';
import { EmailModule } from '../email/email.module';

@Module({
  providers: [BoxCampaignService, BoxCampaignResolver],
  imports: [UserModule, BlockchainModule, EmailModule],
})
export class BoxCampaignModule {}
