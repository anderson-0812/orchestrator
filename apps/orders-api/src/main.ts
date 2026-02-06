import { NestFactory } from '@nestjs/core';
import { OrdersApiModule } from './orders-api.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersApiModule);
  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  console.log(`🚀 Application orders-api is running on: http://localhost:${port}`);
}

bootstrap();
