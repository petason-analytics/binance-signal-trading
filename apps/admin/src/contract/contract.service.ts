import { PrismaService } from '@lib/prisma';
import { Injectable } from '@nestjs/common';
import { Logger } from 'ethers/lib/utils';
import { GABoxContractCreateInput } from './dto/contract.dto';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(private prisma: PrismaService) {}

  async boxContracts() {
    const result = await this.prisma.boxContract.findMany({
      include: {
        chain: true,
      },
    });
    return result;
  }

  async createBoxContract(data: GABoxContractCreateInput) {
    const result = await this.prisma.boxContract.create({
      data: data,
      include: {
        chain: true,
      },
    });
    return result;
  }
}
