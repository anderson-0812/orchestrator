import { NestFactory } from '@nestjs/core';
import { CustomersModule } from './customers-api.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomersModule);
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Application customers-api is running on: http://localhost:${port}`);
}
bootstrap();
