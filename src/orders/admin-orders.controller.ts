import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiParam } from '@nestjs/swagger';
import { OrderStatusService } from './order-status.service';
import { SetOrderStatusDto } from './dto/set-order-status.dto';
import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';
import { OrdersService } from './orders.service';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(AdminSessionGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly orderStatusService: OrderStatusService,
    private readonly ordersService: OrdersService,
  ) {}
  
  @Get()
  listOrders() {
    return this.ordersService.adminListAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', example: 123 })
  getOrder(@Param('id') id: string) {
    return this.ordersService.adminGetOne(Number(id));
  }

  @Get('statuses')
  @ApiBearerAuth()
  listStatuses() {
    return this.orderStatusService.listStatuses();
  }

  @Get(':id/status-history')
  @ApiBearerAuth()
  getHistory(@Param('id') id: string) {
    return this.orderStatusService.getHistory(Number(id));
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  setStatus(@Param('id') id: string, @Body() dto: SetOrderStatusDto) {
    return this.orderStatusService.setStatus({
      orderId: Number(id),
      statusCode: dto.statusCode,
      comment: dto.comment,
      changedBy: 'admin', // na MVP
    });
  }
}