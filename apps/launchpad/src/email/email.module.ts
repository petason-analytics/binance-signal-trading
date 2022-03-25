import { SendGridModule } from '@anchan828/nest-sendgrid';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SendGridModule.forRoot({
      apikey: process.env.SEND_GRID_ACCESS_KEY,
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
