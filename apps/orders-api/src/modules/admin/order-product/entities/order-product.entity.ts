import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Order } from '../../order/entities/order.entity';

@Entity({ name: 'order_items' }) // nombre real en DB 
@Index(['orderId', 'productId'], { unique: true })
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  qty: number; // cantidad

  @Column({ type: 'int' })
  unitPriceCents: number; // precio al momento de la compra

  @Column({ type: 'int' })
  subtotalCents: number; // cantidad * unitPriceCents

  @ManyToOne(() => Order, (order) => order.orderProducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
