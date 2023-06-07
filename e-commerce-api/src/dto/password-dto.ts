import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsDateString } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty() @IsString() @IsNotEmpty() readonly password: string;
  @ApiProperty() @IsString() @IsNotEmpty() readonly confirmedPassword: string;
}

export class ResetPasswordTokensDto {
  @ApiProperty() @IsString() @IsNotEmpty() readonly resetPasswordToken: string;
  @ApiProperty() @IsNumber() @IsNotEmpty() readonly userId: number;
  @ApiProperty() @IsDateString() @IsNotEmpty() readonly createdAt: Date;
  @ApiProperty() @IsDateString() @IsNotEmpty() readonly expiresAt: Date;
}