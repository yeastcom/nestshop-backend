import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from './entities/order-status.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderStatusService } from './order-status.service';
import { AdminOrdersController } from './admin-orders.controller';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderStatus, OrderStatusHistory, Cart, CartItem, Product, PaymentMethod])],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, OrderStatusService],
})
export class OrdersModule {}