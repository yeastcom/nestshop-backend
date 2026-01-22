import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SetOrderStatusDto {
  @ApiProperty({ example: 'paid' })
  @IsString()
  statusCode: string;

  @ApiProperty({ required: false, example: 'Opłacone ręcznie w panelu' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  comment?: string;
}