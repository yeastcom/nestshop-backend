import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from 'src/categories/entities/category.entity';
import { AdminProductsController } from './admin-product.controller';
import { ProductImagesService } from './product-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Category])],
  controllers: [ProductsController, AdminProductsController],
  providers: [ProductsService, ProductImagesService],
})
export class ProductsModule {}
