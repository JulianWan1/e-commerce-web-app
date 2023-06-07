import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { MailOptionsInterface } from 'src/interfaces/mail.interface';

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService){}

	async sendMail(mailOptions:MailOptionsInterface){
		await this.mailerService.sendMail(mailOptions);
	}

}
