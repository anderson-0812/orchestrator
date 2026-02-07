import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";
import { IsPositive } from "class-validator";
import { LengthDb } from "libs/common/globs/generals/length.db";
import { OrderProduct } from "../../order-product/entities/order-product.entity";

@Entity()
@Index(["code", "name"], { unique: true })
export class Product {
    @PrimaryGeneratedColumn()
    @IsPositive()
    id: number;

    @Column("varchar", { length: LengthDb.name, default: "" })
    name: string;   

    @Column("varchar", { length: LengthDb.description, default: "" })
    description: string;

    @Column("varchar", { length: LengthDb.code, default: "" })
    code: string;

    @Column("int", { default: 0 })
    stock: number;

    @Column("decimal", { default: 0, precision: 12, scale: 2 })
    price: number;

    @Column("decimal", { default: 0, precision: 12, scale: 2 })
    discount: number;

    @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
    orderProducts: OrderProduct[];
}
