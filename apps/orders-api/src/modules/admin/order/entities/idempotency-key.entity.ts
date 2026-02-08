import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'idempotency_keys' })
export class IdempotencyKey {
  @PrimaryColumn('varchar', { length: 255 })
  key: string;

  @Column('varchar', { length: 50 })
  targetType: string; // 'order_confirm', 'order_create', etc.

  @Column('int', { nullable: true })
  targetId: number;

  @Column('varchar', { length: 50 })
  status: string; // 'pending', 'completed', 'failed'

  @Column('text', { nullable: true })
  responseBody: string; // JSON guardado de la respuesta

  @CreateDateColumn()
  createdAt: Date;

  @Column('timestamp')
  expiresAt: Date; // fecha de expiración (24hrs típicamente)

  @Index()
  @Column('int', { default: 1 })
  isActive: number; // para soft delete si es necesario
}
