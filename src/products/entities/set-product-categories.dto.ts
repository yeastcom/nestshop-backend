import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt, Min } from 'class-validator';

export class SetProductCategoriesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Lista ID kategorii do przypisania',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  categoryIds: number[];
}
