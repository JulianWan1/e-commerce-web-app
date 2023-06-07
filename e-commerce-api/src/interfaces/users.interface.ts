export interface NewUserPassword {
  hashSaltPassword: string;
  salt: string;
}

export interface FoundUser {
  email: boolean;
  phoneNumber: boolean;
}

