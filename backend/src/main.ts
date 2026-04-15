import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // Serve HLS locally if accessed directly without nginx in dev
  app.use('/hls', express.static(process.env.HLS_OUTPUT_DIR || '/data/hls'));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`\n=========================================`);
  console.log(`✅ BACKEND SERVICE STARTED ON PORT ${port}`);
  console.log(`=========================================\n`);
}
bootstrap();
