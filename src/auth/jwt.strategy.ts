import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from '../../dist/auth/jwt-payload.interface';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import * as config from 'config';

const jwtConfig = config.jwt;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserRepository)
    private userRespository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || jwtConfig.secret,
    });
  }

  // validate if user exists
  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRespository.findOne({ username });

    // if user doest not exists
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
