import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokensMethods } from 'src/auth/auth-methods/tokens-methods';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, JwtService, TokensMethods, EmailService, AuthService],
  exports:[UsersService]
})
export class UsersModule {}
