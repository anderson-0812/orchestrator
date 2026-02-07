import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn } from "typeorm";
import { IsPositive } from "class-validator";
import { LengthDb } from "libs/common/globs/generals/length.db";
import { OrderProduct } from "../../order-product/entities/order-product.entity";

@Entity()
@Index(["sku"], { unique: true })
export class Product {
  @PrimaryGeneratedColumn()
  @IsPositive()
  id: number;

  @Column("varchar", { length: LengthDb.code, default: "" })
  sku: string; // CODIGO DE PRODUCTO 

  @Column("varchar", { length: LengthDb.nameLong, default: "" })
  name: string;

  @Column("varchar", { length: LengthDb.description, default: "" })
  description: string;

  @Column("int", { default: 0 })
  stock: number;

  @Column("int", { default: 0 })
  priceCents: number; 

  @Column("int", { default: 0 })
  discountCents: number; 

  @Column("boolean", { default: true })
  isActive: boolean; 

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date; 

  @OneToMany(() => OrderProduct, (orderProduct) => orderProduct.product)
  orderProducts: OrderProduct[];
}
