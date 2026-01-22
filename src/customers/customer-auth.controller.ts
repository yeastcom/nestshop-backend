import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerLoginDto } from './dto/customer-login.dto';
import { CustomerJwtGuard } from './guards/customer-jwt.guard';

@ApiTags('auth')
@Controller('auth')
export class CustomerAuthController {
  constructor(private readonly authService: CustomerAuthService) {}

  @Post('register')
  register(@Body() dto: CreateCustomerDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: CustomerLoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(CustomerJwtGuard)
  me(@Req() req: Request) {
    return req.user; // { id, email }
  }
}