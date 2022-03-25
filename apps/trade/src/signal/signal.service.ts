import { Injectable, Logger } from "@nestjs/common";
import { Signal } from "./shape/Signal";


@Injectable()
export class SignalService {
  private readonly logger = new Logger(SignalService.name);

  async extractNewTelegramSignal(): Promise<Signal[]> {
    const newSignals: Signal[] = [];

    // check

    return newSignals
  }
}
