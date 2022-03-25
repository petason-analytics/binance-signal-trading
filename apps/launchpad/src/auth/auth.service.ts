import { Injectable, Logger } from '@nestjs/common';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { RedisService } from '../redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PrismaService } from '@lib/prisma';
import { AppError } from '@lib/helper/errors/base.error';
import { randString } from '@lib/helper/string.helper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private userSv: UserService,
  ) {}

  async getNonce(address: string): Promise<string> {
    let nonce: string = await this.redis.client.hget(
      'nonce',
      address.toLowerCase(),
    );
    if (!nonce) {
      nonce = Date.now() + '';
      await this.redis.client.hset('nonce', address.toLowerCase(), nonce);
    }
    return nonce;
  }

  async login(address: string, sig: string) {
    // check exist nonce of address
    const nonce = await this.redis.client.hget('nonce', address.toLowerCase());
    if (!nonce) throw new AppError('NONCE invalid');
    const msg = `0x${Buffer.from(
      [process.env.NFT_METAMASK_MESSAGE, nonce].join(' '),
      'utf8',
    ).toString('hex')}`;
    // veryfy signature
    const recoveredAddr = recoverPersonalSignature({
      data: msg,
      signature: sig,
    });

    if (recoveredAddr.toLowerCase() != address.toLowerCase())
      throw new AppError('Address invalid');

    // Valid, is owner
    let userInfo = await this.userSv.user({
      address: address,
    });
    if (!userInfo) {
      // create new if not exist user
      userInfo = await this.userSv.create({
        address: address,
        code: randString(10),
      });
    }

    const timestamp = Date.now();
    const jwtToken = this.jwt.sign({
      id: userInfo.id,
      timestamp,
    });

    await this.redis.client.hdel('nonce', address.toLowerCase());

    return {
      token: jwtToken,
      user: userInfo,
    };
  }
}
