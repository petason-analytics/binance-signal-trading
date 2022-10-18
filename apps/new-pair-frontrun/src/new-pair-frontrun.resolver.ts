import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class NewPairFrontrunResolver {
  @Query(() => String, { nullable: true })
  async hello(): Promise<string> {
    return 'Hi!';
  }
}
