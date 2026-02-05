import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiQuery } from "@nestjs/swagger"
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  getTree() {
    return this.categoriesService.getTree();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
  
  @Get(":categoryId/products")
  @ApiParam({ name: "categoryId", type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  getCategoryProducts(
    @Param("categoryId", ParseIntPipe) categoryId: number,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.categoriesService.getProductsByCategory(categoryId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    })
  }
}
