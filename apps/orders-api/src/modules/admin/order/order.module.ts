import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderProduct } from '../order-product/entities/order-product.entity';
import { Product } from '../product/entities/product.entity';
import { IdempotencyKey } from './entities/idempotency-key.entity';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [TypeOrmModule.forFeature([Order, OrderProduct, Product, IdempotencyKey])],
  exports: [OrderService],
})
export class OrderModule {}
