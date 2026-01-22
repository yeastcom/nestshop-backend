import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';



@ApiTags('admin-customers')
@UseGuards(AdminSessionGuard)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get('/addresses')
  findAllAddress() {
    return this.customersService.findAllAddress();
  }
}