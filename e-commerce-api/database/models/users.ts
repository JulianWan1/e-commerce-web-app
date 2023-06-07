import { Model } from 'objection';

// TODO: Set JSONSchema for input validation when making a post request
export class Users extends Model {
  id: number;
  fullName: string;
  email: string;
  hashedPassword: string;
  salt: string;
  phoneNumber: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  // Tells Objection which table from the DB belongs to this Model
  static get tableName() {
    return 'users';
  }

  // TODO: Set relationship between the Users model with other related models

  // Sets the relationship between the ResetPasswordTokens and the Users models
  static get relationMappings() {
    // set import here to prevent circular dependency
    const resetPasswordTokens = require('./reset_password_tokens');
    return {
      resetPasswordTokens: {
        relation: Model.HasManyRelation,
        modelClass: resetPasswordTokens,
        join: {
          from: 'users.id',
          to: 'reset_password_tokens.user_id',
        },
      },
    };
  };

}
