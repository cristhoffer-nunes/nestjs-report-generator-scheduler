import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import envVariablesConfig from './config/env-variables.config';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const port = envVariablesConfig.PORT;
  const logger = new Logger(bootstrap.name);
  logger.log(`Env Variables: ${JSON.stringify(envVariablesConfig)}`);
  await app.listen(port, () => {
    logger.log(`Service listening on port ${port}`);
  });
}
bootstrap();
