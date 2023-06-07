import { InjectRedis, Redis } from "@nestjs-modules/ioredis";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export class TokensMethods {
	constructor(
		private readonly jwtService: JwtService,
		@InjectRedis() private readonly redis: Redis,
	){}
	private logger = new Logger('TokensMethods');

	async getTokensByUserId(userId: number, redisHashName: string) {

		let tokensValues = await this.redis.hgetall(redisHashName);

    let tokens = [];

		for (const token in tokensValues) {
			const payload = JSON.parse(tokensValues[token]);

			if (payload && payload.sub && payload.sub === Number(userId)) {
				tokens.push(token);
			}
		}

		return tokens;

	};
	
	async getExpiredTokens(redisHashName: string) {

		let tokensValues = await this.redis.hgetall(redisHashName);

    let expiredTokens = [];

		for (const token in tokensValues) {
			const payload = JSON.parse(tokensValues[token]);

			if (payload && payload.exp && payload.exp <= Date.now()) {
				expiredTokens.push(token);
			}
		}

		return expiredTokens;

	};

	async bulkRevokeTokens(tokensList: string[], redisHashName: string){

		for(let i = 0; i < tokensList.length; i++){
			
			const decodedToken = JSON.stringify(this.jwtService.decode(tokensList[i]));

			await this.redis.hset(`${redisHashName}`, {[tokensList[i]]:decodedToken});
		};

	};

	async bulkDeleteTokens(tokensList: string[], redisHashName: string){
		await this.redis.hdel(redisHashName, ...tokensList);
	};



}