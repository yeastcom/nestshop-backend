import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsUrl({}, { message: 'url must be a valid URL' })
  url: string

  @ApiPropertyOptional({ example: null })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentId: number | null

  @ApiProperty()
  @IsInt()
  @Min(0)
  position: number

  @ApiProperty()
  @IsBoolean()
  isActive: boolean
}