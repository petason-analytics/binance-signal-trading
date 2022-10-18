import { Controller, Get } from '@nestjs/common';
import { NewPairFrontrunService } from './new-pair-frontrun.service';

@Controller()
export class NewPairFrontrunController {
  constructor(private readonly newPairFrontrunService: NewPairFrontrunService) {}

  @Get()
  getHello(): string {
    return this.newPairFrontrunService.getHello();
  }
}
