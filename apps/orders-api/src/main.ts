import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  await app.listen(process.env.PORT ?? 3002);
  console.log(`🚀 Application orders-api is running on: http://localhost:${process.env.PORT}`);
}
bootstrap();
