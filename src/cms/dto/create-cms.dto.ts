import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCmsDto {
    @ApiProperty({ example: 'Regulamin' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'regulamin' })
    @IsString()
    slug: string;

    @ApiPropertyOptional({ example: 'Regulamin sklepu' })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
