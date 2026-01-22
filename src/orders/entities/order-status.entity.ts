import { Column, Entity, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('order_statuses')
export class OrderStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  code: string; // np. "new", "paid"

  @Column({ type: 'varchar', length: 64 })
  name: string; // np. "Nowe", "Opłacone"

  @Column({ type: 'int', default: 0 })
  sort: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}