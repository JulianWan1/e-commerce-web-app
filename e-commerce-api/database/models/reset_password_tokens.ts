import { Model } from 'objection';

// TODO: Set JSONSchema for input validation when making a post request
export class ResetPasswordTokens extends Model {
  id: number;
  userId: number;
  resetPasswordToken: string;
  createdAt: Date;
  updatedAt: Date;
	expiredAt: Date;

  // Tells Objection which table from the DB belongs to this Model
  static get tableName() {
    return 'ResetPasswordTokens';
  }

}
