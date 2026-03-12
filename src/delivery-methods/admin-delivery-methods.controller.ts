import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../admins/guards/admin-jwt-auth.guard';
import { DeliveryMethodsService } from './delivery-methods.service';
import { CreateDeliveryMethodDto } from './dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from './dto/update-delivery-method.dto';
import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';

@ApiTags('admin-delivery-methods')
@Controller('admin/delivery-methods')
@UseGuards(AdminSessionGuard)
export class AdminDeliveryMethodsController {
  constructor(private readonly service: DeliveryMethodsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateDeliveryMethodDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeliveryMethodDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
