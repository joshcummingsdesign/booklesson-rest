import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities';
import { UserService } from 'src/user/user.service';
import { IJwtPayload } from './interfaces';
import { ConfigService } from '@nestjs/config';
import { EConfigOptions } from 'src/config';
import { CryptoService } from 'src/crypto/crypto.service';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
  ) {}

  async validateUser(payload: {
    email: string;
    password: string;
  }): Promise<User> {
    const user = await this.userService.findByEmail(payload.email, {
      withAuth: true,
    });

    const isValidPassword = this.cryptoService.comparePassword(
      payload.password,
      user.auth.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException();
    }

    const { auth, ...result } = user;
    return result as User;
  }

  login(user: User): IJwtPayload {
    const payload = { username: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async validateUserFromTokenPayload(payload: {
    id: number;
    email: string;
  }): Promise<User> {
    const user = await this.userService.findOne(payload.id);
    if (user.email !== payload.email) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
