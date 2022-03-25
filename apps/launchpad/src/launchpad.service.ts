import { Injectable } from '@nestjs/common';

@Injectable()
export class LaunchpadService {
  getHello(): string {
    return 'Hello World!';
  }
}
