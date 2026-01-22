import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_status_history')
@Index(['orderId', 'id'])
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ type: 'varchar', length: 32 })
  statusCode: string; // snapshot: "new" / "paid" itd.

  @Column({ type: 'varchar', length: 255, nullable: true })
  comment: string | null;

  // na MVP: admin jako string (np. email), później adminId
  @Column({ type: 'varchar', length: 128, nullable: true })
  changedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;
}