import { LengthDb } from "libs/common/globs/generals/length.db";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { IsPositive } from "class-validator";

@Entity()
// @Index(["identityCard", "email", "phone"], { unique: true })
@Index(["identityCard"], { unique: true })
@Index(["email"], { unique: true })
@Index(["phone"], { unique: true })
export class Customer {
    @PrimaryGeneratedColumn()
    @IsPositive()
    id: number;

    @Column("varchar", { length: LengthDb.identityCard, nullable: true })
    @Index()
    identityCard: string;

    @Column("varchar", { length: LengthDb.firtsName, default: "" })
    firstName: string;

    @Column("varchar", { length: LengthDb.lastName, default: "" })
    lastName: string;

    @Column("varchar", { length: LengthDb.email, nullable: true })
    @Index()
    email: string;

    @Column("varchar", { length: LengthDb.phone, nullable: true })
    @Index()
    phone: string;

    @Column("varchar", { length: LengthDb.address, nullable: true })
    address: string;

    @Column("boolean", { default: true })
    isActive: boolean;
}

