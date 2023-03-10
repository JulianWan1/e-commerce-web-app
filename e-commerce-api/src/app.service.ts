import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private logger = new Logger('AppService');
  getHello(): string {
    this.logger.log('Smokin!');
    return 'Hello World!';
  }
}
