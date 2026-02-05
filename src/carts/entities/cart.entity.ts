import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Customer } from 'src/customers/entities/customer.entity';
import { CustomerAddress } from 'src/customers/entities/customer-address.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  token: string;

  @Column({ type: 'int', nullable: true })
  customerId: number | null;
  @ManyToOne(() => Customer, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  status: 'active' | 'converted';

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @ManyToOne(() => CustomerAddress, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "deliveryAddressId" })
  deliveryAddress?: CustomerAddress;

  @ManyToOne(() => CustomerAddress, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "invoiceAddressId" })
  invoiceAddress?: CustomerAddress;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}