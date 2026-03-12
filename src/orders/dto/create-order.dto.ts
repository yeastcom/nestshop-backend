import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  paymentMethodId: number;
}