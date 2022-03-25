import { PrismaService } from '@lib/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { GBoxCampaignCreateInput } from './box-campaign.type';
import { GABoxPriceCreateInput } from './dto/box-campaign.dto';

@Injectable()
export class BoxCampaignService {
  private readonly logger = new Logger(BoxCampaignService.name);

  constructor(private prisma: PrismaService) {}

  async boxCampaign(uid: string) {
    const result = await this.prisma.boxCampaign.findUnique({
      where: {
        uid,
      },
      include: {
        boxTypes: true,
      },
    });
    return result;
  }

  async createBoxCampaign(data: GBoxCampaignCreateInput) {
    const result = await this.prisma.boxCampaign.create({
      data: data,
    });
    return result;
  }

  async createBoxPrice(data: GABoxPriceCreateInput) {
    console.log('data: ', data);
    const result = await this.prisma.boxPrice.create({
      data: data,
    });
    return result;
  }
}
