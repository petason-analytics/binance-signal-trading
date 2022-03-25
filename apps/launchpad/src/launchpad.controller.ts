import { Controller, Get } from "@nestjs/common";
import { LaunchpadService } from "./launchpad.service";

@Controller()
export class LaunchpadController {
  constructor(private readonly launchpadService: LaunchpadService) {}

  @Get()
  getHello(): string {
    return this.launchpadService.getHello();
  }
}
