import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { SignalService } from "./signal.service";
import { Signal, SignalGraphql } from "./shape/Signal";

@Resolver()
export class SignalResolver {
  constructor(private signalService: SignalService) {}

  @Query(() => String, { nullable: true })
  async hello(): Promise<string> {
    return 'HI';
  }

  @Mutation(() => [SignalGraphql], {
    description: 'fetch new service',
  })
  async extractNewTelegramSignal(): Promise<Signal[]> {
    const result = await this.signalService.extractNewTelegramSignal();
    return result;
  }
}
