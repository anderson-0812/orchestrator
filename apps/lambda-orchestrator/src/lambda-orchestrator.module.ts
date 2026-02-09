import { Module } from '@nestjs/common';
import { OrchestController } from './lambda-orchestrator.controller';
import { OrchestService } from './lambda-orchestrator.service';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), 'apps/lambda-orchestrator/.env'), // para monorepo

    }),
  ],
  controllers: [OrchestController],
  providers: [OrchestService],
})
export class LambdaOrchestratorModule {}
