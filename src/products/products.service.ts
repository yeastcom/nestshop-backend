import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from '../categories/entities/category.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { productImageUrls } from './product-image.urs';

@Injectable()
export class ProductsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly imagesRepo: Repository<ProductImage>,
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const defaultCategory = await this.categoriesRepo.findOne({
      where: { id: dto.defaultCategoryId },
    });
    if (!defaultCategory)
      throw new BadRequestException('Default category not found');

    return this.dataSource.transaction(async (manager) => {
      const product = manager.create(Product, {
        name: dto.name,
        slug: dto.slug,
        description: dto.description ?? null,
        price: dto.price,
        sku: dto.sku ?? null,
        stockQty: dto.stockQty ?? 0,
        isActive: dto.isActive ?? true,
        defaultCategoryId: dto.defaultCategoryId,
      });

      const savedProduct = await manager.save(Product, product);

      return manager.findOneOrFail(Product, {
        where: { id: savedProduct.id },
        relations: { images: true },
        order: { images: { position: 'ASC' } },
      });
    });
  }

  async findAll() {
    const items = await this.productsRepo.find({
      relations: { images: true, defaultCategory: true },
      order: { id: 'ASC' },
    });

    return items.map((p) => this.mapProduct(p));
  }

  private mapProduct(p: any) {
  return {
    ...p,
    images: (p.images ?? []).map((img: any) => ({
      ...img,
      urls: productImageUrls(img.id),
    })),
  };
}

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true, defaultCategory: true, categories: true },
    });

    if (!product) throw new NotFoundException('Product not found');
    return this.mapProduct(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.productsRepo.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!existing) throw new NotFoundException('Product not found');

    return this.dataSource.transaction(async (manager) => {
      // update pól produktu
      manager.merge(Product, existing, {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description ?? null }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.sku !== undefined ? { sku: dto.sku ?? null } : {}),
        ...(dto.stockQty !== undefined ? { stockQty: dto.stockQty ?? 0 } : {}),
        ...(dto.isActive !== undefined
          ? { isActive: dto.isActive ?? true }
          : {}),
      });

      await manager.save(Product, existing);

      return manager.findOneOrFail(Product, {
        where: { id },
        relations: { images: true },
        order: { images: { position: 'ASC' } },
      });
    });
  }

  async remove(id: number): Promise<void> {
    const res = await this.productsRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Product not found');
  }

  async setCategories(productId: number, categoryIds: number[]) {
    const product = await this.productsRepo.findOne({
      where: { id: productId },
      relations: { categories: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    // pobierz kategorie, upewnij się że wszystkie istnieją
    const uniqueIds = [...new Set(categoryIds)];
    const categories = await this.categoriesRepo.findByIds(uniqueIds as any); // w TypeORM 0.3 bywa findBy({id: In(...)})
    if (categories.length !== uniqueIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    product.categories = categories;

    // opcjonalnie: dopilnuj, by defaultCategory zawsze był w categories
    const hasDefault = categories.some(
      (c) => c.id === product.defaultCategoryId,
    );
    if (!hasDefault) {
      const def = await this.categoriesRepo.findOne({
        where: { id: product.defaultCategoryId },
      });
      if (def) product.categories.push(def);
    }

    await this.productsRepo.save(product);

    return this.productsRepo.findOne({
      where: { id: productId },
      relations: { categories: true, defaultCategory: true, images: true },
      order: { images: { position: 'ASC' } },
    });
  }
}
