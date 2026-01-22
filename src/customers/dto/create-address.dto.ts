import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'shipping', enum: ['shipping', 'billing'] })
  @IsIn(['shipping', 'billing'])
  type: 'shipping' | 'billing';

  @ApiProperty({ example: 'ul. Długa 1/2' })
  @IsString()
  street: string;

  @ApiProperty({ example: 'Warszawa' })
  @IsString()
  city: string;

  @ApiProperty({ example: '00-001' })
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'PL', description: 'ISO-3166-1 alpha-2' })
  @IsString()
  @Length(2, 2)
  countryCode: string;

  @ApiPropertyOptional({ example: 'Firma Sp. z o.o.' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'PL1234567890' })
  @IsOptional()
  @IsString()
  vatId?: string;

  @ApiPropertyOptional({ example: '+48 600 000 000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}