import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IsPositive } from "class-validator";
import { StatusOrder } from "libs/common/globs/generals/status-order";
import { OrderProduct } from "../../order-product/entities/order-product.entity";


@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    @IsPositive()
    id: number;

    @Column('int', { default: 0 })
    cantProducts: number;

    @Column("decimal", { default: 0, precision: 12, scale: 2 })
    totalPrice: number;

    @Column("varchar", { length: 20 })
    nroOrder: string;

    @Column({
        type: 'int',
        default: StatusOrder.CREATED,
    })
    @Index()
    status: StatusOrder;

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.order)
    orderProducts: OrderProduct[];
}
