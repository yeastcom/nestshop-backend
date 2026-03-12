import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'jan@shop.pl' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'StrongPass123!' })
  @IsOptional()
  @ValidateIf((o) => !!o.password)
  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[0-9]).+$/, {
    message: 'password must contain at least one uppercase letter and one number',
  })
  password?: string;

  @ApiProperty({ example: 'Jan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Kowalski' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isGuest?: boolean;
}