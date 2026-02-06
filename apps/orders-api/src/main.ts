import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders-api.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  const port = Number(process.env.PORT) || 3002;
  await app.listen(port);
  console.log(`🚀 Application orders-api is running on: http://localhost:${port}`);
}

bootstrap();
