import { Injectable } from '@nestjs/common';

@Injectable()
export class NewPairFrontrunService {
  getHello(): string {
    return 'Hello World!';
  }
}
