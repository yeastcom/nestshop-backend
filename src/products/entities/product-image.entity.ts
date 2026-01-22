// src/products/entities/product-image.entity.ts
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
@Index(['productId', 'position'])
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ type: 'int', default: 0 })
  position: number;

  @Column({ type: 'bool', default: false })
  cover: boolean;
}