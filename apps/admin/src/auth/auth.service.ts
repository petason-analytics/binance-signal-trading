import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@lib/prisma';
import { randString } from '@lib/helper/string.helper';
import { PasswordUtils } from '@lib/helper/password.util';
import { AppError } from '@lib/helper/errors/base.error';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user || !user.password) {
      throw new AppError('Bad request');
    }
    const isValid = await PasswordUtils.comparePassword(pass, user.password);
    if (!isValid) {
      throw new AppError('Bad request');
    }
    const jwtToken = this.jwt.sign({
      id: user.id,
      role: user.role,
    });
    const { password, ...result } = user;

    return {
      token: jwtToken,
      user: result,
    };
  }

  async register(email: string, pass: string) {
    // const isStrong = PasswordUtils.validate(pass);
    const hashPass = await PasswordUtils.hashPassword(pass);
    const user = await this.prisma.user.create({
      data: {
        role: 'ADMIN',
        address: '',
        email,
        code: randString(10),
        password: hashPass,
        profile: {
          create: {
            full_name: email.split('@')[0],
          },
        },
      },
    });
    const { password, ...result } = user;
    return result;
  }
}
