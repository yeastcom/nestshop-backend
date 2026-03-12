import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DeliveryMethodsService } from './delivery-methods.service';

@ApiTags('delivery-methods')
@Controller('delivery-methods')
export class DeliveryMethodsController {
  constructor(private readonly service: DeliveryMethodsService) {}

  @Get()
  findAll() {
    return this.service.findAllActive();
  }
}
