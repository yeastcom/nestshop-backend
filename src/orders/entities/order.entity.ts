import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  customerId: number;

  @Column({ type: 'varchar', length: 24, unique: true })
  orderNumber: string;

  @Index()
  @Column({ type: 'varchar', length: 32, default: 'new' })
  statusCode: string; 

  @OneToMany(() => OrderStatusHistory, (h) => h.order)
  statusHistory: OrderStatusHistory[];

  @Column({ type: 'varchar', length: 3, default: 'PLN' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  itemsTotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  // snapshoty adresów
  @Column({ type: 'json' })
  deliveryAddress: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  invoiceAddress: Record<string, any> | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}