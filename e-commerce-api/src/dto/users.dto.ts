// data transfer object:
// - ensures data being sent/received complies to a set format
// - classes or interfaces can be used to create DTO but classes are recommended

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsPhoneNumber } from 'class-validator';

export class NewUserDetailsDto {
  @ApiProperty() @IsString() @IsNotEmpty() readonly fullName: string;
  @ApiProperty() @IsEmail() @IsNotEmpty() readonly email: string;
  @ApiProperty() @IsString() @IsNotEmpty() readonly password: string;
  @ApiProperty() @IsPhoneNumber() @IsNotEmpty() readonly phoneNumber: string;
}

export class CreateNewUserDto {
  @ApiProperty() @IsString() @IsNotEmpty() readonly fullName: string;
  @ApiProperty() @IsEmail() @IsNotEmpty() readonly email: string;
  @ApiProperty() @IsString() @IsNotEmpty() readonly hashedPassword: string;
  @ApiProperty() @IsString() @IsNotEmpty() readonly salt: string;
  @ApiProperty() @IsPhoneNumber() @IsNotEmpty() readonly phoneNumber: string;
  @ApiProperty() @IsString() @IsNotEmpty() readonly role: string;
}
