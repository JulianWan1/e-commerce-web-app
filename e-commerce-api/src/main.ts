import { NestFactory } from '@nestjs/core';
import { setupDb } from 'database/database';
import { AppModule } from './app.module';

async function bootstrap() {
  setupDb();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  await app.listen(3000);
}
bootstrap();
