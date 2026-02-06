import { Module } from '@nestjs/common';
import { OrdersController } from './orders-api.controller';
import { OrdersService } from './orders-api.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersApiModule {}
