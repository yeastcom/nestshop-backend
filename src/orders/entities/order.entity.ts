import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { DeliveryMethod } from '../../delivery-methods/entities/delivery-method.entity';
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

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0.00' })
  shippingTotal: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: string;

  @Index()
  @Column({ type: 'int', nullable: true })
  paymentMethodId: number | null;

  @ManyToOne(() => PaymentMethod, { nullable: true, eager: false })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod | null;

  @Index()
  @Column({ type: 'int', nullable: true })
  deliveryMethodId: number | null;

  @ManyToOne(() => DeliveryMethod, { nullable: true, eager: false })
  @JoinColumn({ name: 'deliveryMethodId' })
  deliveryMethod: DeliveryMethod | null;

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