import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [EmailModule],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
