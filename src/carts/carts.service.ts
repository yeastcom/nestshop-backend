import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart) private readonly cartsRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemsRepo: Repository<CartItem>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
  ) {}

  private generateToken(): string {
    return randomBytes(24).toString('hex'); // 48 chars
  }

  async getOrCreateCart(customerId: number | null, token: string | null) {
    // 1) customer cart
    if (customerId) {
      let cart = await this.cartsRepo.findOne({
        where: { customerId, status: 'active' },
        relations: { items: true },
        order: { items: { id: 'ASC' } },
      });

      if (!cart) {
        cart = this.cartsRepo.create({
          customerId,
          token: this.generateToken(),
          status: 'active',
          items: [],
        });
        cart = await this.cartsRepo.save(cart);
      }

      return cart;
    }

    // 2) guest cart
    if (token) {
      const cart = await this.cartsRepo.findOne({
        where: { token, status: 'active' },
        relations: { items: true },
        order: { items: { id: 'ASC' } },
      });
      if (cart) return cart;
    }

    // 3) create new guest cart
    let cart = this.cartsRepo.create({
      customerId: null,
      token: this.generateToken(),
      status: 'active',
      items: [],
    });
    cart = await this.cartsRepo.save(cart);
    return cart;
  }

  async addItem(cart: Cart, productId: number, qty: number) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (qty <=0 ) throw new ConflictException('Quantity must be > 0');


    const currentQty = await this.getTotalQtyForProductInCart(cart.id, productId);
    const nextQty = currentQty + qty;

    if (nextQty > product.stockQty) {
      this.throwStockError(productId, nextQty, product.stockQty);
    }

    // załóżmy że masz w Product price: string
    const unitPrice = product.price;

    // jeśli item istnieje -> zwiększ qty
    const existing = await this.itemsRepo.findOne({
      where: { cartId: cart.id, productId },
    });

    

    if (existing) {
      existing.qty += qty;
      return this.itemsRepo.save(existing);
    }

    const item = this.itemsRepo.create({
      cartId: cart.id,
      productId,
      qty,
      unitPrice,
    });

    return this.itemsRepo.save(item);
  }

  async updateItem(cart: Cart, itemId: number, qty: number) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');

    if (qty === 0) {
      await this.itemsRepo.remove(item);
      return null;
    }

    item.qty = qty;
    return this.itemsRepo.save(item);
  }

  async removeItem(cart: Cart, itemId: number) {
    const item = await this.itemsRepo.findOne({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new NotFoundException('Cart item not found');

    await this.itemsRepo.remove(item);
    return true;
  }

  async clear(cart: Cart) {
    await this.itemsRepo.delete({ cartId: cart.id });
    return true;
  }

  private async getTotalQtyForProductInCart(cartId: number, productId: number): Promise<number> {
    const row = await this.itemsRepo
      .createQueryBuilder('ci')
      .select('COALESCE(SUM(ci.qty), 0)', 'sum')
      .where('ci.cartId = :cartId', { cartId })
      .andWhere('ci.productId = :productId', { productId })
      .getRawOne<{ sum: string }>();

    return Number(row?.sum ?? 0);
  }

  private throwStockError(productId: number, requested: number, available: number) {
    throw new ConflictException({
      message: 'Insufficient stock',
      productId,
      requested,
      available,
    });
  }
}