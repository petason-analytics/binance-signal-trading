import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameResolver } from './game.resolver';

@Module({
  providers: [GameResolver, GameService],
  imports: [
    // UserModule,
  ],
})
export class GameModule {}
