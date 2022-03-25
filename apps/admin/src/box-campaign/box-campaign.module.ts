import { Module } from '@nestjs/common';
import { BoxCampaignResolver } from './box-campaign.resolver';
import { BoxCampaignService } from './box-campaign.service';

@Module({
  providers: [BoxCampaignResolver, BoxCampaignService],
})
export class BoxCampaignModule {}
