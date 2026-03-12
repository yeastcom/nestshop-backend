import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumberString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateDeliveryMethodDto {
  @ApiProperty({ example: 'Kurier DPD' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Dostawa w 1-2 dni robocze' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '9.99' })
  @IsNumberString()
  price: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  position?: number;
}
