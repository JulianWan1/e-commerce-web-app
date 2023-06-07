import { InjectRedis, Redis } from "@nestjs-modules/ioredis";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { REFRESH_SECRET_KEY } from "src/configurations/env.config";

export class RefreshValidity {
	constructor(
		private readonly jwtService: JwtService,
		@InjectRedis() private readonly redis: Redis,
	){}
	private logger = new Logger('RefreshValidity');
	// Function to check refresh jwt validity
	async checkRefreshValidity(refreshToken: string) {
		try{

			// Check if the refresh token provided is revoked
			const revokedRefreshToken:any = await this.redis.hexists('revoked_refresh_tokens', refreshToken);

			if (revokedRefreshToken) {
				// throw new UnauthorizedException('Refresh Token is revoked, try logging in again');
				return null;
			};

			const user:any = this.jwtService.verify(refreshToken, {secret:REFRESH_SECRET_KEY});
			
			this.logger.log(`user: ${JSON.stringify(user)}`);
			
			return user;

		}catch(error){
			this.logger.log(JSON.stringify(error));
			return null;
		}
	}
}
	