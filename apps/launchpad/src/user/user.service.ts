import { AppError } from '@lib/helper/errors/base.error';
import { PrismaService } from '@lib/prisma';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { from } from 'rxjs';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { EmailInput, EmailType, UserInput } from '../email/email.type';
import { ProfileUpdateInput } from './user.type';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async user(where: Prisma.UserWhereInput, includeProfile = false) {
    const userInfo = await this.prisma.user.findFirst({
      where: where,
      include: {
        profile: includeProfile,
      },
    });
    return userInfo;
  }

  async create(user: Prisma.UserCreateInput) {
    const userInfo = await this.prisma.user.create({
      data: {
        ...user,
        profile: {
          create: {},
        },
      },
      include: {
        profile: true,
      },
    });
    return userInfo;
  }
  async updateProfile(userId: number, data: ProfileUpdateInput) {
    const result = await this.prisma.userProfile.update({
      where: {
        user_id: userId,
      },
      data: data,
      include: {
        user: true,
      },
    });
    return result;
  }

  // async verifyEmail(userId: number, email: string) {
  //   const user = await this.prisma.user.findUnique({
  //     where: {
  //       id: userId,
  //     },
  //   });
  //   if (!user) {
  //     throw new AppError('Bad request');
  //   }
  //   if (!!user.email) {
  //     if (user.email != email) {
  //       // exist other email
  //       throw new AppError('Email exist');
  //     }
  //     // updated before
  //     return user;
  //   }

  //   //Todo: verify email by code
  //   const result = await this.prisma.user.update({
  //     where: {
  //       id: userId,
  //     },
  //     data: {
  //       email,
  //     },
  //   });
  //   return result;
  // }
  async verifyEmail(userId: number, email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new AppError('Bad request');
    }
    await this.emailService.sendEmailNotifications(
      userId,
      EmailType.verifyEmail,
      '',
      email,
    );
    return true;
  }

  async updateEmail(userId: number, email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new AppError('Bad request');
    }
    await this.prisma.user.update({
      data: {
        email: email,
      },
      where: {
        id: userId,
      },
    });
    return true;
  }
}
