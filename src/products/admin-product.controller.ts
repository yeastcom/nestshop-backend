import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';
import { ProductsService } from './products.service';
import { ProductImagesService } from './product-images.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SetProductCategoriesDto } from './entities/set-product-categories.dto';



@ApiTags('admin-products')
@ApiBearerAuth()
@UseGuards(AdminSessionGuard)
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly imagesService: ProductImagesService,
  ) {}

  // ===== PRODUCTS CRUD (MVP) =====

  @Post()
  @ApiBearerAuth()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  findAll() {
    // na MVP bez filtrów
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 12 })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 12 })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', example: 12 })
  remove(@Param('id') id: string) {
    return this.productsService.remove(Number(id));
  }

  // ===== IMAGES =====

  @Post(':productId/images')
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', example: 12 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.imagesService.uploadImage(Number(productId), file);
  }

  @Patch(':productId/images/:imageId/cover')
  @ApiBearerAuth()
  @ApiParam({ name: 'productId', example: 12 })
  @ApiParam({ name: 'imageId', example: 164 })
  setCover(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.imagesService.setCover(Number(productId), Number(imageId));
  }

  @Post(':productId/categories')
  setCategories(
    @Param('productId', ParseIntPipe) id: number,
    @Body() dto: SetProductCategoriesDto,
  ) {
    return this.productsService.setCategories(id, dto.categoryIds);
  }
}