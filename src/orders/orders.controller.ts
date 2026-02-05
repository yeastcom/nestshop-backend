import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CustomerAuthGuard } from 'src/customers/guards/customer-auth.guard';
@ApiTags('orders')
@ApiBearerAuth()
@UseGuards(CustomerAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const customerId = (req.user as any).id;
    return this.ordersService.createFromCart(customerId, dto);
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Req() req: Request) {
    const customerId = (req.user as any).id;
    return this.ordersService.findAllForCustomer(customerId);
  }

  @Get(':id')
  @ApiBearerAuth()
  findOne(@Req() req: Request, @Param('id') id: string) {
    const customerId = (req.user as any).id;
    return this.ordersService.findOneForCustomer(customerId, Number(id));
  }
}