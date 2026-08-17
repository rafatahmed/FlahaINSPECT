import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('worker');
  logger.log('FlahaINSPECT worker context started (job handlers land in PR-07 / PR-09)');
  app.enableShutdownHooks();
  // Keep the process alive until SIGTERM. Job poll loop arrives in PR-07 / PR-09.
  await new Promise<void>((resolve) => {
    const stop = () => {
      void app.close().finally(resolve);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
  });
}

void bootstrap();
