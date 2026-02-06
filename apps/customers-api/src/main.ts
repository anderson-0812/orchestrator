import { NestFactory } from '@nestjs/core';
import { CustomersApiModule } from './customers-api.module';

async function bootstrap() {
  const app = await NestFactory.create(CustomersApiModule);
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port);
  console.log(`🚀 Application customers-api is running on: http://localhost:${port}`);
}
bootstrap();
