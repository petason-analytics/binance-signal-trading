/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { SendGridService } from '@anchan828/nest-sendgrid';
import { AppError } from '@lib/helper/errors/base.error';
import { PrismaService } from '@lib/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { EmailInput, EmailType, UserInput } from './email.type';
import { first_template, verify_template } from './template_email';

@Injectable()
export class EmailService {
  constructor(
    private prisma: PrismaService,
    private readonly sendGrid: SendGridService,
  ) {}
  async sendEmail(
    from: EmailInput,
    to: UserInput,
    content: string,
  ): Promise<void> {
    try {
      await this.sendGrid.send({
        to: to.email,
        from: {
          name: from.name,
          email: from.email,
        },
        subject: `Hello ${to.name}`,
        text: content,
        html: content,
      });
    } catch (error) {
      console.error(error);
    }
  }
  async sendEmailNotifications(
    userId: number,
    emailType: EmailType,
    campaignName: string,
    toEmail?: string,
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const userInput = new UserInput();
    userInput.email = user.email;
    userInput.name = user.name;
    userInput.userId = user.id;
    const emailInput = new EmailInput();
    switch (emailType) {
      case EmailType.verifyEmail: {
        user.email = toEmail;
        emailInput.email = process.env.VERIFY_EMAIL_LUCIS_NETWORK;
        emailInput.name = process.env.VERIFY_EMAIL_NAME_LUCIS_NETWORK;
        const content: string = verify_template(userInput);
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.successfulTransaction: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Successful Transaction',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.registerWhitelist: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Successful whitelist registration',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.whitelistRegisterAfterOneDay: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Whitelist registration will open after 1 day',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.whitelistRegisterAfter15Minutes: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Whitelist registration will open after 15 minutes',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.whitelistOpenAfterOneDay: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Whitelist phase will open after 1 day',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.whitelistOpenAfter15Min: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Whitelist phase will open after 15 minutes',
          campaignName,
        );

        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.boxCampaignOpenAfterOneDay: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Buy phase will open after one day',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.boxCampaignOpenAfter15Minutes: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Buy phase will open after 15 minutes',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
      case EmailType.campaignClose: {
        emailInput.email = process.env.EMAIL_NOTIFICATION_LUCIS_NETWORK;
        emailInput.name = process.env.EMAIL_NAME_LUCIS_NETWORK;
        const content: string = first_template(
          userInput,
          'Campaign is closed',
          campaignName,
        );
        await this.sendEmail(emailInput, userInput, content);
        break;
      }
    }

    return true;
  }
}
