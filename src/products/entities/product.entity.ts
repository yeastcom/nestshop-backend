import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ProductImage } from './product-image.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'text', nullable: true })
  shortDescription?: string | null;

  // cena: decimal (nigdy float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string; // TypeORM dla MySQL zwraca decimal jako string

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64, nullable: true })
  sku?: string | null;

  @Column({ type: 'int', default: 0 })
  stockQty: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => ProductImage, (img) => img.product, {
    cascade: true,
  })
  images: ProductImage[];

  @ManyToOne(() => Category, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'defaultCategoryId' })
  defaultCategory: Category;

  @Column({ type: 'int' })
  defaultCategoryId: number;

  @ManyToMany(() => Category, (c) => c.products, { cascade: false })
  @JoinTable({
    name: 'product_categories',
    joinColumn: { name: 'productId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
  })
  categories: Category[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
