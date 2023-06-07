import { Body, Controller, Logger, Post, UseGuards, Request, Get, Delete, Param, Query } from '@nestjs/common';
import { LocalAuthGuard } from 'src/auth/guard/local-auth.guard';
import { NewUserDetailsDto } from 'src/dto/users.dto';
import { PhoneExistsException, EmailExistsException } from 'src/exceptions/users.exception';
import { FoundUser } from 'src/interfaces/users.interface';
import { UsersService } from './users.service';
import { AuthService } from 'src/auth/auth.service';
import { AccessAuthGuard } from 'src/auth/guard/access-auth.guard';
import { ResetPasswordDto } from 'src/dto/password-dto';

@Controller('users')
export class UsersController {
  private logger = new Logger('UsersController');
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @Post('/')
  async createNewUser(@Body() user: NewUserDetailsDto) {

    // Check if user exists first
    // TODO: Return the email & phoneNumber conditions to FE to make error alert on the email & hp number fields
    const existingUser:FoundUser = await this.usersService.checkUserAlreadyExists(user);
    const {email, phoneNumber} = existingUser
    if(email){
      throw new EmailExistsException
    }
    if(phoneNumber){ 
      throw new PhoneExistsException;
    }

    return await this.usersService.createNewUser(user);
  }

  // How does the auth/login endpoint work:
  // When called, UseGuards(LocalAuthGuard) will be invoked first before triggering the endpoint
  // UseGuards(LocalAuthGuard) is a built-in nestjs/passport guard that employs the local strategy that we've defined
  // When guard is called, the user's credentials are passed to the validate function & user object is returned (from local strategy file)
  // Eventually, passport automatically generates a user object (based on whatever that was returned from validate function) 
  // It will be found in the req object as req.user (from there we can use it to be included in our jwt body)

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    // Trigger jwt issuance
    return this.authService.login(req.user);
  }

  @UseGuards(AccessAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // @UseGuards(AccessAuthGuard)
  @Delete('auth/logout')
  async logout(@Request() req){

    this.logger.log(req.headers.authorization);
    this.logger.log(req.headers.refresh_token);

    const accessToken = `${req.headers.authorization.split(" ")[1]}`;
    const refreshToken = `${req.headers.refresh_token}`;

    return this.authService.logout(accessToken, refreshToken);
  }

  @Delete('auth/delete')
  async deleteExpiredTokens(){
    return this.authService.expiredTokensDeletion();
  }

  @Post('auth/request-reset-password')
  async requestResetPassword(
    @Body('email') email:string
  ){
    return this.authService.requestResetPassword(email);
  }

  @Post('auth/reset-password/:userId/:resetPasswordToken')
  async resetPassword(
    @Param('userId') userId: number,
    @Param('resetPasswordToken') resetPasswordToken: string,
    @Body() resetPasswordBody:ResetPasswordDto
  ){
    return this.authService.resetPassword(userId, resetPasswordToken, resetPasswordBody);
  }

  @Post('auth/revoke/:userId')
  async revokeUserTokens(
    @Param('userId') userId: number
  ){
    return this.authService.massTokenRevocation(userId);
  }



}
