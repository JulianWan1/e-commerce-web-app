import { Injectable, Logger } from '@nestjs/common';
import { Users } from 'database/models/users';
import { CreateNewUserDto, NewUserDetailsDto } from 'src/dto/users.dto';
import { RoleType } from 'src/enum/users.enum';
import { FoundUser } from 'src/interfaces/users.interface';
import { Bcrypt } from 'src/utils/Bcrypt';

@Injectable()
export class UsersService {
  private logger = new Logger('UsersService');
  constructor(){}

  // In one transaction, query for the count of each email and phoneNumber fields
  async checkUserAlreadyExists(params: NewUserDetailsDto):Promise<FoundUser> {
    this.logger.log('Checking if user already exists');
    let emailExists = false;
    let phoneExists = false;

    try {
      await Users.transaction(async trx => {
        // Check if email exists
        const emailCount = await Users.query(trx)
          .where('email', params.email)
          .resultSize();
        emailExists = emailCount > 0;

        // Check if phone number exists
        const phoneCount = await Users.query(trx)
          .where('phone_number', params.phoneNumber)
          .resultSize();
        phoneExists = phoneCount > 0;
      });
    } catch (error) {
      this.logger.log('Error checking user:', error);
      throw error;
    }
    return { 
      email: emailExists, 
      phoneNumber: phoneExists 
    };
  }

  async createNewUser(params: NewUserDetailsDto){
    //  data to DB
    this.logger.log('Creating New User');
    const user:Users = await Users.transaction(
      async (trx) => {

        const { 
          fullName,
          email,
          password,
          phoneNumber
        } = params;

        // Acquire salt, salt & hash the password
        const { hashSaltPassword, salt } = await Bcrypt.createPasswordHash(password);

        // Set the data to be sent to DB
        // set role enum and set user as default (user & admin roles as enum)
        const addNewUser: CreateNewUserDto = {
          fullName,
          email,
          hashedPassword: hashSaltPassword,
          salt: salt,
          phoneNumber,
          role: RoleType.User,
        };

        const newUserCreated:Users = await Users.query(trx).insert(addNewUser);

        return newUserCreated;
      }
    );

    return user;
  }

  // Find a user based on email
  async findUser(email: string): Promise<Users | undefined>{
    const user:Users[] = await Users.query().where('email', email);
    return user[0];
  }

}
