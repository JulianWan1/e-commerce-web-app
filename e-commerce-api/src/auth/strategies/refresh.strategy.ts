import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { REFRESH_SECRET_KEY } from 'src/configurations/env.config';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refreshJWT') {
  jwtService: any;
  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: REFRESH_SECRET_KEY,
    });
  }

  async validate(payload: any) {

    return { userId: payload.sub, fullName: payload.fullName };
    
  }
}