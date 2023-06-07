import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ACCESS_SECRET_KEY } from 'src/configurations/env.config';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { JwtService } from '@nestjs/jwt';
import { RefreshValidity } from '../auth-methods/refresh-validity';
import { TokenSet } from 'src/interfaces/token.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'accessJWT') {
  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshValidity: RefreshValidity,
    private readonly authService: AuthService,
    @InjectRedis() private readonly redis: Redis,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ACCESS_SECRET_KEY,
    });
  }
  private logger = new Logger('AccessStrategy');

  // authenticate method allows us to override the default validation process of the strategy 
  async authenticate(req: any, options?: any) {
    this.logger.log('Authenticating Access Token...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      this.logger.log('No access token found');
      return this.fail(new UnauthorizedException(), 401);
    };

    // Check if the access token provided is revoked
    const revokedAccessToken:any = await this.redis.hexists('revoked_access_tokens', token);

    if(revokedAccessToken){
      this.logger.log('Access Token has been revoked');
      return this.fail(new UnauthorizedException(), 401);
    };

    try {

      // Check if the access token is valid
      const decodedAccessToken = await this.jwtService.verifyAsync(token, {
        secret: ACCESS_SECRET_KEY,
      });

      // Call success callback with decoded payload
      return this.success(decodedAccessToken);
    } catch (error) {
      /*
        If fail, then check the refresh token validity
        If refresh token is valid, create a new token pair & send the refresh token to revocation list
        If refresh token invalid, throw the error
        Call fail callback with error
       */
      this.logger.log(`access ${error.message}`);

      const refreshToken:string = req.headers['refresh_token'] || req.query.refresh_token;

			// Check if refresh token exists
			if(!refreshToken){
        this.logger.log(`error: no refresh token found from req headers`);
				return this.fail(new UnauthorizedException('No Refresh Token found'), 401);
      }
    
      // Check if refresh token is vaild
      try {
        // Validate refresh token
        const userFromRefreshToken: any | null = await this.refreshValidity.checkRefreshValidity(refreshToken);
        
        this.logger.log(`userFromRefreshToken: ${JSON.stringify(userFromRefreshToken)}`);

        if(!userFromRefreshToken){
          throw new UnauthorizedException('Refresh Token has been revoked');
        }

        // Generate new access & refresh tokens
        const newSetTokens: TokenSet =  await this.authService.login(userFromRefreshToken);

        // Set new tokens in response header
        req.res.set('Authorization', `Bearer ${newSetTokens.accessToken}`);
        req.res.set('refresh_token', `${newSetTokens.refreshToken}`);

        // Set the refresh token to be revoked
        await this.redis.hset('revoked_refresh_tokens',{[refreshToken]:userFromRefreshToken})

        // Call success callback with a success message
        this.logger.log('New tokens generated successfully')
        this.success('New tokens generated successfully');
      } catch (error) {
        // Refresh token is invalid
        this.logger.log(`error: ${error.message}`);
        return this.fail(new UnauthorizedException(error.message), 401);
      }
      this.logger.log('Access token invalid');
      return this.fail(new UnauthorizedException(error.message), 401);
    }
  }

  // validate method is a method that is called after a token has successfully been validated
  // usually returns the payload
  async validate(payload: any) {
    return payload;
  }
}