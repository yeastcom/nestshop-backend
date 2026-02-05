import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AdminCategoryController } from './admin-category.controller';
import { CategoriesController } from './categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  controllers: [CategoriesController, AdminCategoryController],
  providers: [CategoriesService],
  imports: [TypeOrmModule.forFeature([Category, Product])],
})
export class CategoriesModule {}
