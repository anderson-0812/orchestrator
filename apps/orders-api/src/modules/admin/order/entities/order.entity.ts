import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { IsPositive } from "class-validator";
import { StatusOrder } from "libs/common/globs/generals/status-order";
import { OrderProduct } from "../../order-product/entities/order-product.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  @IsPositive()
  id: number;

  @Column('int')
  @Index()
  customerId: number; 

  @Column('int', { default: 0 })
  totalCents: number; 

  @Column({
    type: 'int',
    default: StatusOrder.CREATED,
  })
  @Index()
  status: StatusOrder;

  @Column('int', { default: 0 }) 
  cantProducts: number;
  
  @Column("varchar", { length: 20 }) 
  nroOrder: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderProduct, (op) => op.order)
  orderProducts: OrderProduct[];

}
