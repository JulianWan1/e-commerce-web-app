const bcrypt = require('bcryptjs');
import { NewUserPassword } from 'src/interfaces/users.interface';

const SALT_ROUND = 12;

export class Bcrypt {
  // Password hashing for user sign up
  // static function to set the function to be only called from this class alone
  // and not by any other instance of this class
  static async createPasswordHash(password: string): Promise<NewUserPassword> {
    const saltRound = bcrypt.genSaltSync(SALT_ROUND);
    const hashSaltPassword = await bcrypt.hash(password, saltRound);
    const hashAndSalt: NewUserPassword = {
      hashSaltPassword,
      salt: saltRound,
    };
    return hashAndSalt;
  }

  // Password check for user log in
  static async validatePassword(password: string, hashedPassword: string):Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
