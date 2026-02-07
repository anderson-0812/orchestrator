import { Module } from '@nestjs/common';
import { OrdersApiController } from './orders-api.controller';
import { OrdersApiService } from './orders-api.service';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './modules/admin/order/order.module';
import { ProductModule } from './modules/admin/product/product.module';
import { OrderProductModule } from './modules/admin/order-product/order-product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: '.env', 
      envFilePath: join(process.cwd(), 'apps/orders-api/.env'), // para monorepo

    }),

    // DB
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true,
      synchronize: process.env.SYNCHRONIZE === 'TRUE',
    }),

    OrderModule,
    ProductModule,
    OrderProductModule,
  ],
  controllers: [OrdersApiController],
  providers: [OrdersApiService],
})
export class OrdersApiModule { }
