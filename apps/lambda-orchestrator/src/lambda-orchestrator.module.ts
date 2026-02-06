import { Module } from '@nestjs/common';
import { OrchestController } from './lambda-orchestrator.controller';
import { OrchestService } from './lambda-orchestrator.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [OrchestController],
  providers: [OrchestService],
})
export class OrchestModule {}
