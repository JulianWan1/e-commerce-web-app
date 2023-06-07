import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Bcrypt } from 'src/utils/Bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } from 'src/configurations/env.config';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { TokenPayload, TokenSet } from 'src/interfaces/token.interface';
import { TokensMethods } from './auth-methods/tokens-methods';
import { Cron } from '@nestjs/schedule';
import { Users } from 'database/models/users';
import { ResetPasswordTokens } from 'database/models/reset_password_tokens';
import { ResetPasswordDto, ResetPasswordTokensDto } from 'src/dto/password-dto';
import { MailOptionsInterface } from 'src/interfaces/mail.interface';
import { EmailService } from 'src/email/email.service';
const crypto = require('crypto');

@Injectable()
export class AuthService {
	private logger = new Logger('UsersService');
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly tokensMethod: TokensMethods,
		private readonly emailService: EmailService,
		@InjectRedis() private readonly redis: Redis,
	){}

	// Method to validate login details and returns user details
	async validateUser(email:string, password:string):Promise<any>{
		const user = await this.usersService.findUser(email);
		if(!user){
			return null;
		}
		const isValidPassword:boolean = await Bcrypt.validatePassword(password, user.hashedPassword);
		if(isValidPassword){
			const {id, fullName, role} = user;
			return {id, fullName, role};
		}
		return null;
	}

	// Method which sends token pair to users after successful user authentication
	async login(user: any) {
		let payload: TokenPayload = {fullName: user.fullName, sub: user.id || user.sub, role: user.role};

		const accessToken = this.jwtService.sign(payload, {secret:ACCESS_SECRET_KEY, expiresIn: '60s'})
		const refreshToken = this.jwtService.sign(payload, {secret:REFRESH_SECRET_KEY, expiresIn: '120s'})

		// Get the access & refresh tokens payload after being signed (to get their iat & exp dates)
		const decodedAccess = JSON.stringify(this.jwtService.decode(accessToken));
		const decodedRefresh = JSON.stringify(this.jwtService.decode(refreshToken));


		// Set the access_token & refresh_token to redis cache
		this.logger.log('Setting access & refresh tokens in redis cache...');
		await this.redis.hset('access_tokens',{[accessToken]:decodedAccess});
		await this.redis.hset('refresh_tokens',{[refreshToken]:decodedRefresh});
		this.logger.log('Setting access & refresh tokens in redis cache complete!');

		const tokenSet: TokenSet = {
			// currently using secret for testing, later when really producing a true site, use a privateKey instead
			accessToken: accessToken,
			refreshToken: refreshToken
		};

		return tokenSet;

	}


	async logout(accessToken: string, refreshToken: string){
		// let payload: TokenPayload = {fullName: user.fullName, sub: user.id || user.sub, role: user.role};
		
		try{

		const decodedAccess = JSON.stringify(this.jwtService.decode(accessToken));
		const decodedRefresh = JSON.stringify(this.jwtService.decode(refreshToken));

			this.logger.log(`logout payload: ${JSON.stringify(decodedAccess)}`);

			this.logger.log('Revoking access & refresh tokens...');

			await this.redis.hset('revoked_access_tokens', {[accessToken]:decodedAccess});
			await this.redis.hset('revoked_refresh_tokens', {[refreshToken]:decodedRefresh});

			this.logger.log('Revoked access & refresh tokens successful')

			this.logger.log('Deleting access & refresh tokens...');

			const accessTokenDeletion:number = await this.redis.hdel('access_tokens', accessToken);
			const refreshTokenDeletion:number = await this.redis.hdel('refresh_tokens', refreshToken);

			if(!accessTokenDeletion){
				this.logger.log(`no access token found to be deleted, returned: ${accessTokenDeletion}`)
			}

			if(!refreshTokenDeletion){
				this.logger.log(`no refresh token found to be deleted, returned: ${refreshTokenDeletion}`)
			}

			this.logger.log('Deletion of access & refresh tokens successful');

			return ('Logout successful!');

		}catch(err){

			return err;

		};
	}

	// Deals with password reset request from user
	async requestResetPassword(email: string){
		// find the user if exists in DB
		const foundUser:Users = 
			await Users.query()
			.where('email', email)
			.first();

		// If the user does not exist, throw an error
		if (!foundUser) {
			throw new Error('User with provided email does not exist');
		};

		// Generate a unique token
		const token = crypto.randomBytes(20).toString('hex');

		// Set token expiry time to 1 hour from current time
		let expiresAt = new Date;
		expiresAt.setHours(expiresAt.getHours() + 1);

		const resetPasswordTokenObject: ResetPasswordTokensDto = {
			resetPasswordToken:token,
			userId: foundUser.id,
			createdAt: new Date,
			expiresAt 
		}

		// Save the token and user ID to the resetPasswordTokens model
		await ResetPasswordTokens.query()
		.insert(resetPasswordTokenObject);

		// Send an email to the user with the password reset link
		const resetPasswordLink = `<add your process.env.CLIENT_URL here>/reset-password?token=${token}&user_id=${foundUser.id}`;
		const mailOptions:MailOptionsInterface = {
			to: `${email}`,
			subject: 'Password Reset Request',
			html: `Hi ${foundUser.fullName},<br><br>Please click <a href="${resetPasswordLink}">here</a> to reset your password. This link will expire in 1 hour.<br><br>Best regards,<br>Your App Team`,
		};

		// Currently need to get account activation from Brevo, but if no activation, no probs
		// We will assume that all emails sent were successful and we can move on to reset password endpoint
		this.logger.log(`Sending reset password email to user...`)
		await this.emailService.sendMail(mailOptions);

	};

	async resetPassword(
		userId: number, 
		resetPasswordToken: string, 
		resetPasswordBody: ResetPasswordDto
	){

		this.logger.log(`userId: ${userId}`);
		this.logger.log(`resetPasswordToken: ${resetPasswordToken}`);
		this.logger.log(`resetPasswordBody: ${JSON.stringify(resetPasswordBody)}`)

		// Find the resetPasswordToken & the associated userId
		const foundResetPasswordToken:ResetPasswordTokens = await ResetPasswordTokens.query()
		.where('resetPasswordToken', resetPasswordToken)
		.andWhere('userId', userId)
		.first();

		this.logger.log(`foundResetPasswordToken: ${JSON.stringify(foundResetPasswordToken)}`);
		
		// If the resetPasswordToken is not present and has expired, throw an error
		if(!foundResetPasswordToken || foundResetPasswordToken.expiredAt < new Date){
			// TODO: Replace Error with Exception (Check if custom or preset exception is required)
			throw new Error('Reset token provided either not found or has expired');
		};

		// Check if the both the password & the confirmedPassword matches
		const { password, confirmedPassword} = resetPasswordBody;
		if(password !== confirmedPassword){
			throw new Error('Password & Confirmed Password provided are not similar!');
		};


		// Create user's new password & hash
		const {hashSaltPassword, salt} = await Bcrypt.createPasswordHash(password);

		// Update the user's password & hash
		await Users.query()
		.patch({ 
			hashedPassword:hashSaltPassword,
			salt: salt,
			updatedAt: new Date
		})
		.findById(userId);
		
		// Delete the resetPasswordToken from the DB
		const deletedResetPasswordToken:ResetPasswordTokens[] = await ResetPasswordTokens.query()
		.delete()
		.where({
			userId: userId,
			resetPasswordToken: resetPasswordToken
		})
		.returning('*');

		this.logger.log(`Deleted reset password token: ${JSON.stringify(deletedResetPasswordToken[0])}`)

		// Return user password has been reset successfully message
		return("User's password has been succesfully changed!");

	};

	// Deals with the revocation of tokens (if a user's tokens are compromised)
	async massTokenRevocation(userId: number){

		// Get all tokens (access & refresh) from the user found in the cache
		this.logger.log(`Getting all access tokens from user id: ${userId}...`);
		const userAccessTokens:string[] = await this.tokensMethod.getTokensByUserId(userId,'access_tokens');
		this.logger.log(`Retrieved all access tokens from user id: ${userId}!`);
		this.logger.log(`Getting all refresh tokens from user id: ${userId}...`);
		const userRefreshTokens:string[] = await this.tokensMethod.getTokensByUserId(userId,'refresh_tokens');
		this.logger.log(`Retrieved all refresh tokens from user id: ${userId}!`);

		// Put them into their respective revocation collections
		this.logger.log(`Revoking all access tokens from user id: ${userId}...`);
		await this.tokensMethod.bulkRevokeTokens(userAccessTokens, 'revoked_access_tokens');
		this.logger.log(`Revoked all access tokens from user id: ${userId}!`);
		this.logger.log(`Revoking all refresh tokens from user id: ${userId}...`);
		await this.tokensMethod.bulkRevokeTokens(userRefreshTokens, 'revoked_refresh_tokens');
		this.logger.log(`Revoked all refresh tokens from user id: ${userId}!`);

		// Delete them from the access & refresh tokens collection
		this.logger.log(`Deleting all access tokens from user id: ${userId}...`);
		await this.tokensMethod.bulkDeleteTokens(userAccessTokens, 'access_tokens');
		this.logger.log(`Deleted all access tokens from user id: ${userId}!`);
		this.logger.log(`Deleting all refresh tokens from user id: ${userId}...`);
		await this.tokensMethod.bulkDeleteTokens(userRefreshTokens, 'refresh_tokens');
		this.logger.log(`Deleted all refresh tokens from user id: ${userId}!`);

	};

	// Cronjob to run deletion of expired tokens every day at 12:00 AM, GMT+08 (Msia time)
	@Cron('0 0 0 * * *', { timeZone: 'Asia/Singapore' })
	async expiredTokensDeletion(){
		// Get all expired tokens for all hashes
		this.logger.log('Retrieving all expired access tokens...');
		const expiredAccessTokens = await this.tokensMethod.getExpiredTokens('access_tokens');
		this.logger.log(`Expired access tokens length: ${expiredAccessTokens.length}`);
		this.logger.log('Retrieving all expired refresh tokens...');
		const expiredRefreshTokens = await this.tokensMethod.getExpiredTokens('refresh_tokens');
		this.logger.log(`Expired refresh tokens length: ${expiredRefreshTokens.length}`);
		this.logger.log('Retrieving all expired revoked access tokens...');
		const expiredRevokedAccessTokens = await this.tokensMethod.getExpiredTokens('revoked_access_tokens');
		this.logger.log(`Expired revoked access tokens length: ${expiredRevokedAccessTokens.length}`);
		this.logger.log('Retrieving all expired revoked refresh tokens...');
		const expiredRevokedRefreshTokens =	await this.tokensMethod.getExpiredTokens('revoked_refresh_tokens');
		this.logger.log(`Expired revoked refresh tokens length: ${expiredRevokedRefreshTokens.length}`);

		// Delete all expired tokens of all hashes
		if(expiredAccessTokens.length > 0){
			this.logger.log(`Deleting expired access tokens...`);
			await this.tokensMethod.bulkDeleteTokens(expiredAccessTokens,'access_tokens');
			this.logger.log(`Expired access tokens successfully deleted!`);
		};
		if(expiredRefreshTokens.length > 0){
			this.logger.log(`Deleting expired refresh tokens...`);
			await this.tokensMethod.bulkDeleteTokens(expiredRefreshTokens,'refresh_tokens');
			this.logger.log(`Expired refresh tokens successfully deleted!`);
		};
		if(expiredRevokedAccessTokens.length > 0){
			this.logger.log(`Deleting expired revoked access tokens...`);
			await this.tokensMethod.bulkDeleteTokens(expiredRevokedAccessTokens,'revoked_access_tokens');
			this.logger.log(`Expired revoked access tokens successfully deleted!`);
		};
		if(expiredRevokedRefreshTokens.length > 0){
			this.logger.log(`Deleting expired revoked refresh tokens...`);
			await this.tokensMethod.bulkDeleteTokens(expiredRevokedRefreshTokens,'revoked_refresh_tokens');
			this.logger.log(`Expired revoked refresh tokens successfully deleted!`);
		};

	};

}
