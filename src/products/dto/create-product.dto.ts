import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @ApiProperty({ example: 0, description: 'Kolejność zdjęcia' })
  @IsInt()
  @Min(0)
  position: number;

  @ApiProperty({
    example: true,
    description: 'Czy to zdjęcie okładkowe (cover)',
  })
  @IsBoolean()
  cover: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Koszulka treningowa' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'koszulka-treningowa' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Lekka koszulka do treningu.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Lekka koszulka do treningu.' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: '99.99', description: 'Cena jako string (decimal)' })
  @IsString()
  price: string;

  @ApiPropertyOptional({ example: 'TSHIRT-001' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 25, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQty?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 1, description: 'ID domyślnej kategorii produktu' })
  @IsInt()
  @Min(1)
  defaultCategoryId: number;
}
