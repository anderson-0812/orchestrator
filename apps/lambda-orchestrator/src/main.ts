import { NestFactory } from '@nestjs/core';
import { LambdaOrchestratorModule } from './lambda-orchestrator.module';

async function bootstrap() {
  const app = await NestFactory.create(LambdaOrchestratorModule);
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 Application lambda-orchestrator is running on: http://localhost:${port}`);
}
bootstrap();
