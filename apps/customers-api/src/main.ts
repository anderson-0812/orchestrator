import { NestFactory } from '@nestjs/core';
import { CustomersModule } from './customers.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomersModule);
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Application customers-api is running on: http://localhost:${process.env.PORT}`);
}
bootstrap();
