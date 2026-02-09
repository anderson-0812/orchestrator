import { NestFactory } from '@nestjs/core';
import { OrdersApiModule } from './orders-api.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(OrdersApiModule);
  
  // Configurar CORS
  app.enableCors();
  
  // Configurar validación global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  console.log(`🚀 Application orders-api is running on: http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
}

bootstrap();
