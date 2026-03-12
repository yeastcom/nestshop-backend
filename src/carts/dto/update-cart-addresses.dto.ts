import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class UpdateCartAddressesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  deliveryAddressId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  invoiceAddressId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  deliveryMethodId?: number;
}
