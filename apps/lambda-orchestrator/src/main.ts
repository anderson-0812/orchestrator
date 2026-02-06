import { NestFactory } from '@nestjs/core';
import { OrchestModule } from './lambda-orchestrator.module';

async function bootstrap() {
  const app = await NestFactory.create(OrchestModule);
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 Application lambda-orchestrator is running on: http://localhost:${port}`);
}
bootstrap();
