import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Customer } from './customer.entity';

export type AddressType = 'shipping' | 'billing';

@Entity({ name: 'customer_addresses' })
@Index(['customerId', 'type'])
export class CustomerAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customerId: number;

  @ManyToOne(() => Customer, (c) => c.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @Column({ type: 'varchar', length: 20 })
  type: AddressType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  company?: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  vatId?: string | null;

  @Column({ type: 'varchar', length: 255 })
  street: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 20 })
  postalCode: string;

  // ISO-3166-1 alpha-2: PL, CZ, DE...
  @Column({ type: 'char', length: 2 })
  countryCode: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string | null;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;
}