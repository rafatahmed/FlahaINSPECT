import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('worker');
  logger.log('FlahaINSPECT worker context started (job handlers land in PR-07 / PR-09)');
  app.enableShutdownHooks();
}

void bootstrap();
