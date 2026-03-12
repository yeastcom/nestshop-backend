import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';

import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart-item.entity';

import { Product } from '../products/entities/product.entity';

import { CustomerAddress } from 'src/customers/entities/customer-address.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,

    @InjectRepository(Cart)
    private readonly cartsRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemsRepo: Repository<CartItem>,

    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepo: Repository<PaymentMethod>,
  ) {}

  // --- helpers do kasy (na start “cents”, żeby uniknąć floatów) ---
  private moneyMul(unit: string, qty: number): string {
    const cents = Math.round(Number(unit) * 100) * qty;
    return (cents / 100).toFixed(2);
  }

  private moneyAdd(values: string[]): string {
    const cents = values.reduce((acc, v) => acc + Math.round(Number(v) * 100), 0);
    return (cents / 100).toFixed(2);
  }

  private addressToSnapshot(a: CustomerAddress): Record<string, any> {
    // Dopasuj pola pod swoją encję Address (poniżej “sensowny default”)
    return {
      fullName: a.customer ? (a.customer.firstName + " " + a.customer.lastName) : null,
      company: a.company ?? null,
      phone: a.phone ?? null,
      street: a.street ?? null,
      city: a.city ?? null,
      postalCode: a.postalCode ?? null,
      countryCode: a.countryCode ?? null
    };
  }

  private async getActiveCustomerCart(customerId: number): Promise<Cart> {
    const cart = await this.cartsRepo.findOne({
      where: { customerId, status: 'active' },
      relations: { deliveryAddress: true, invoiceAddress: true, deliveryMethod: true },
    });
    if (!cart) throw new BadRequestException('Cart not found');
    return cart;
  }

  async createFromCart(customerId: number, dto: CreateOrderDto) {
    // Walidacje przed transakcją (nie modyfikują danych)
    const cart = await this.getActiveCustomerCart(customerId);

    const cartItems = await this.cartItemsRepo.find({
      where: { cartId: cart.id },
    });
    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');

    const delivery = cart.deliveryAddress;
    if (!delivery) throw new BadRequestException('Delivery address not set in cart');

    const invoice: CustomerAddress | null = cart.invoiceAddress ?? null;

    const deliveryMethod = cart.deliveryMethod;
    if (!deliveryMethod) throw new BadRequestException('Delivery method not set in cart');

    const paymentMethod = await this.paymentMethodsRepo.findOne({
      where: { id: dto.paymentMethodId, isActive: true },
    });
    if (!paymentMethod) throw new BadRequestException('Payment method not found');

    const savedOrderId = await this.dataSource.transaction(async (manager) => {
      // 1) Sprawdź stock i zmniejsz go atomowo
      for (const item of cartItems) {
        const product = await manager.findOne(Product, { where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

        if (item.qty > product.stockQty) {
          throw new ConflictException({
            message: 'Insufficient stock at checkout',
            productId: product.id,
            requested: item.qty,
            available: product.stockQty,
          });
        }

        await manager.decrement(Product, { id: product.id }, 'stockQty', item.qty);
      }

      // 2) Snapshoty adresów
      const deliverySnapshot = this.addressToSnapshot(delivery);
      const invoiceSnapshot = invoice ? this.addressToSnapshot(invoice) : null;

      // 3) Pobierz produkty do snapshotu name/sku
      const productIds = [...new Set(cartItems.map((i) => i.productId))];
      const products = await manager.find(Product, { where: { id: In(productIds) } });
      const byId = new Map(products.map((p) => [p.id, p]));

      // 4) Utwórz zamówienie
      const order = manager.create(Order, {
        customerId,
        orderNumber: `ORD-${Date.now()}`,
        statusCode: 'new',
        currency: 'PLN',
        paymentMethodId: paymentMethod.id,
        deliveryMethodId: deliveryMethod.id,
        deliveryAddress: deliverySnapshot,
        invoiceAddress: invoiceSnapshot,
        itemsTotal: '0.00',
        shippingTotal: '0.00',
        total: '0.00',
        items: [],
      });
      const savedOrder = await manager.save(Order, order);

      // 5) Utwórz pozycje zamówienia
      const orderItems = cartItems.map((ci) => {
        const p = byId.get(ci.productId);
        if (!p) throw new NotFoundException(`Product ${ci.productId} not found`);

        return manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: ci.productId,
          name: p.name,
          sku: p.sku ?? null,
          qty: ci.qty,
          unitPrice: ci.unitPrice,
          lineTotal: this.moneyMul(ci.unitPrice, ci.qty),
        });
      });
      await manager.save(OrderItem, orderItems);

      // 6) Zaktualizuj totale
      const itemsTotal = this.moneyAdd(orderItems.map((i) => i.lineTotal));
      const shippingTotal = Number(deliveryMethod.price).toFixed(2);
      const total = this.moneyAdd([itemsTotal, shippingTotal]);
      await manager.update(Order, savedOrder.id, { itemsTotal, shippingTotal, total });

      // 7) Zamknij koszyk
      await manager.update(Cart, cart.id, { status: 'converted' });

      return savedOrder.id;
    });

    return this.findOneForCustomer(customerId, savedOrderId);
  }

  async findAllForCustomer(customerId: number) {
    return this.ordersRepo.find({
      where: { customerId },
      order: { id: 'DESC' },
      /*select: {
        id: true,
        orderNumber: true,
        itemsTotal: true,

      }*/
    });
  }

  async findOneForCustomer(customerId: number, orderId: number) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId, customerId },
      relations: { items: true, paymentMethod: true, deliveryMethod: true },
      order: { items: { id: 'ASC' } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminListAll() {
    return this.ordersRepo.find({
      order: { id: 'DESC' },
    });
  }

  async adminGetOne(orderId: number) {
    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: {
        items: true,
        customer: true,
      } as any,
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}