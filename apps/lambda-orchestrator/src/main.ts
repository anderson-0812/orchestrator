import { NestFactory } from '@nestjs/core';
import { OrchestModule } from './orchest.module';

async function bootstrap() {
  const app = await NestFactory.create(OrchestModule);
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Application lambda-orchestrator is running on: http://localhost:${process.env.PORT}`);
}
bootstrap();
