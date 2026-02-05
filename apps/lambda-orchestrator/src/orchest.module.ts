import { Module } from '@nestjs/common';
import { OrchestController } from './orchest.controller';
import { OrchestService } from './orchest.service';
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
