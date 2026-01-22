import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  deliveryAddressId: number;

  @ApiProperty({ example: 13, required: false })
  @IsOptional()
  @IsInt()
  invoiceAddressId?: number;
}