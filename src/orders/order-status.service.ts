import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from './entities/order-status.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(Order) private readonly ordersRepo: Repository<Order>,
    @InjectRepository(OrderStatus) private readonly statusesRepo: Repository<OrderStatus>,
    @InjectRepository(OrderStatusHistory) private readonly historyRepo: Repository<OrderStatusHistory>,
  ) {}

  async listStatuses() {
    return this.statusesRepo.find({ where: { isActive: true }, order: { sort: 'ASC', id: 'ASC' } });
  }

  async setStatus(params: {
    orderId: number;
    statusCode: string;
    comment?: string;
    changedBy?: string | null;
  }) {
    const { orderId, statusCode, comment, changedBy } = params;

    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const statusExists = await this.statusesRepo.findOne({ where: { code: statusCode, isActive: true } });
    if (!statusExists) throw new BadRequestException('Unknown statusCode');

    // nic się nie zmienia -> opcjonalnie ignoruj
    if (order.statusCode === statusCode) {
      return order;
    }

    // update order (bez dotykania relacji)
    await this.ordersRepo.update(orderId, { statusCode });

    // dopisz historię
    const history = this.historyRepo.create({
      orderId,
      statusCode,
      comment: comment ?? null,
      changedBy: changedBy ?? null,
    });
    await this.historyRepo.save(history);

    return this.ordersRepo.findOne({ where: { id: orderId } });
  }

  async getHistory(orderId: number) {
    const order = await this.ordersRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    return this.historyRepo.find({ where: { orderId }, order: { id: 'DESC' } });
  }
}