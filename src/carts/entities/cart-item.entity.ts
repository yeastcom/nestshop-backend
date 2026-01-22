import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from './cart.entity';

@Entity('cart_items')
@Index(['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cartId: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @Column({ type: 'int' })
  productId: number;

  @Column({ type: 'int' })
  qty: number;

  // decimal jako string (tak jak TypeORM zaleca)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: string;
}