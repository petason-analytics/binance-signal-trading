import { PrismaService } from '@lib/prisma';
import { GameCreateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game-create.input';
import { GameUpdateInput } from '@lib/prisma/@generated/prisma-nestjs-graphql/game/game-update.input';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(private prisma: PrismaService) {}

  async create(data: GameCreateInput) {
    const game = await this.prisma.game.create({
      data: data,
    });
    return game;
  }

  async findAll() {
    const games = await this.prisma.game.findMany();
    return games;
  }

  findOne(id: number) {
    return `This action returns a #${id} game`;
  }

  update(id: number, updateGameInput: GameUpdateInput) {
    return `This action updates a #${id} game`;
  }

  remove(id: number) {
    return `This action removes a #${id} game`;
  }
}
