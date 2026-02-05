import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsString()
  url: string

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId: number | null

  @ApiProperty()
  @IsString()
  position: number

  @ApiProperty()
  @IsBoolean()
  isActive: boolean
}