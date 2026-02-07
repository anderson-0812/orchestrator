import { Module } from '@nestjs/common';
import { OrderProductService } from './order-product.service';
import { OrderProductController } from './order-product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProduct } from './entities/order-product.entity';
import { Order } from '../order/entities/order.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  controllers: [OrderProductController],
  providers: [OrderProductService],
  imports: [TypeOrmModule.forFeature([OrderProduct, Order, Product])],
  exports: [OrderProductService],
})
export class OrderProductModule {}
