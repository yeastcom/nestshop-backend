import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Post, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CustomerAuthGuard } from './guards/customer-auth.guard';

@ApiTags('customers')
@Controller('customers')
@UseGuards(CustomerAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }
  // --- Addresses ---

  @Get(':id/addresses')
  listAddresses(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.listAddresses(id);
  }

  @Post(':id/addresses')
  addAddress(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAddressDto) {
    return this.customersService.addAddress(id, dto);
  }

  @Put(':id/addresses/:addressId')
  updateAddress(
    @Param('id', ParseIntPipe) id: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customersService.updateAddress(id, addressId, dto);
  }

  @Delete(':id/addresses/:addressId')
  @HttpCode(204)
  removeAddress(
    @Param('id', ParseIntPipe) id: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ) {
    return this.customersService.removeAddress(id, addressId);
  }
}