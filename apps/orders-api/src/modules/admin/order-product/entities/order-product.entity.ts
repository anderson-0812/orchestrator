import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Order } from '../../order/entities/order.entity';

@Entity()
@Index(['orderId', 'productId'], { unique: true })
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  price: number;

  @ManyToOne(() => Order, (order) => order.orderProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
