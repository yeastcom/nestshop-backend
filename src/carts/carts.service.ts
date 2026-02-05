import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { productImageUrls } from 'src/products/product-image.urs';

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
        relations: { customer: {addresses: true}, items: {product: {images: true}}},
        order: { items: { id: 'ASC' } },
      });
      console.log(cart)
      if (!cart) {
        cart = this.cartsRepo.create({
          customerId,
          token: this.generateToken(),
          status: 'active',
          items: [],
        });
        cart = await this.cartsRepo.save(cart);
      }

      return this.attachImageUrlsToCart(cart)
    }

    // 2) guest cart
    if (token) {
      const cart = await this.cartsRepo.findOne({
        where: { token, status: 'active' },
        relations: { customer: true, items: {product: {images: true}}},
        order: { items: { id: 'ASC' } },
      });
      if (cart) return this.attachImageUrlsToCart(cart)
    }

    // 3) create new guest cart
    let cart = this.cartsRepo.create({
      customerId: null,
      token: this.generateToken(),
      status: 'active',
      items: [],
    });
    cart = await this.cartsRepo.save(cart);

    return this.attachImageUrlsToCart(cart)
  }

  async addItem(cart: Cart, productId: number, qty: number) {
    const product = await this.productsRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    if (qty <=0 ) throw new ConflictException('Quantity must be > 0');


    const currentQty = Number(await this.getTotalQtyForProductInCart(cart.id, productId) ?? 0)
    const nextQty = currentQty + Number(qty)

    console.log(nextQty)
    if (nextQty > product.stockQty) {
      this.throwStockError(productId, nextQty, product.stockQty);
    }

    // załóżmy że masz w Product price: string
    const unitPrice = product.price;

    // jeśli item istnieje -> zwiększ qty
    const existing = await this.itemsRepo.findOne({
      where: { cartId: cart.id, productId },
      relations: {product: true}
    });

    

    if (existing) {
      existing.qty = nextQty;
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

  private attachImageUrlsToCart(cart: any) {
  const base = "/media"

  for (const item of cart.items ?? []) {
    const p = item.product
    if (!p?.images) continue

    p.images = p.images.map((img: any) => ({
      ...img,
      urls: {
        original: `${base}/${this.pathByImageId(img.id)}/original.jpg`,
        cart_default: `${base}/${this.pathByImageId(img.id)}/cart_default.jpg`,
        small_default: `${base}/${this.pathByImageId(img.id)}/small_default.jpg`,
        medium_default: `${base}/${this.pathByImageId(img.id)}/medium_default.jpg`,
        home_default: `${base}/${this.pathByImageId(img.id)}/home_default.jpg`,
        large_default: `${base}/${this.pathByImageId(img.id)}/large_default.jpg`,
      },
    }))
  }

  return cart
}

private pathByImageId(imageId: number) {
  // twoja logika: np. "img/1/6/4" dla 164 itd.
  const s = String(imageId)
  return `img/p/${s.split("").join("/")}`
}
}