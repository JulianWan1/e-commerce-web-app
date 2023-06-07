import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from 'src/configurations/env.config';
import { UsersModule } from 'src/users/users.module';
import { TokensMethods } from './auth-methods/tokens-methods';
import { RefreshValidity } from './auth-methods/refresh-validity';
import { AuthService } from './auth.service';
import { AccessStrategy } from './strategies/access.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    EmailModule,
    JwtModule.register({
      // replace secret with secretOrPrivateKey when using private key
      secret: ACCESS_SECRET_KEY,
      signOptions: { expiresIn: '10s' },
    }),
    // JwtModule.register({
    //   // replace secret with secretOrPrivateKey when using private key
    //   secret: REFRESH_SECRET_KEY,
    //   signOptions: { expiresIn: '30s' },
    // }),
    ScheduleModule.forRoot(),
  ],
  providers: [AuthService, LocalStrategy, AccessStrategy, RefreshStrategy, RefreshValidity, TokensMethods],
  exports: [AuthService],
})
export class AuthModule {}
