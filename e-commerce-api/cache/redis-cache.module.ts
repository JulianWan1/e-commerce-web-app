import { RedisModule } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { REDIS_HOST, REDIS_PORT } from 'src/configurations/env.config';

// Setup Connection to Redis

@Module({
	imports:[
		RedisModule.forRoot({
			config:{
				host: REDIS_HOST,
        port: REDIS_PORT,
			}
		}),
	]
})

export class RedisCacheModule {};
