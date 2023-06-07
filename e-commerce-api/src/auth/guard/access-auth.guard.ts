import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REFRESH_SECRET_KEY } from 'src/configurations/env.config';
import { AuthService } from '../auth.service';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { TokenSet } from 'src/interfaces/token.interface';

@Injectable()
export class AccessAuthGuard extends AuthGuard('accessJWT') {}
