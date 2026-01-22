import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Odzież' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'odziez' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Kategoria odzieży' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: null,
    description: 'ID kategorii nadrzędnej',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId?: number;
}
