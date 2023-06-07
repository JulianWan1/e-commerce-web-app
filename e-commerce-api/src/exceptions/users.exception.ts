import { HttpException, HttpStatus } from "@nestjs/common";

export class EmailExistsException extends HttpException {
	constructor(){
		super(
			'Email already in use',
			HttpStatus.CONFLICT,
		)
	}
}

export class PhoneExistsException extends HttpException {
	constructor(){
		super(
			'Phone Number already in use',
			HttpStatus.CONFLICT,
		)
	}
}