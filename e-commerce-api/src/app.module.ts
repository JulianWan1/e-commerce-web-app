import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RedisCacheModule } from 'cache/redis-cache.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [UsersModule, AuthModule, RedisCacheModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
