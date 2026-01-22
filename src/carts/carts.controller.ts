import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Req, Res } from '@nestjs/common';
import { ApiHeader, ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CartsService } from './carts.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UseGuards } from '@nestjs/common';
import { OptionalCustomerJwtGuard } from '../customers/guards/optional-customer-jwt.guard';

@ApiTags('cart')
@Controller('cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  private extractCartToken(req: Request, headerToken?: string): string | null {
    // 1) header
    if (headerToken) return headerToken;

    // 2) cookie (jeśli masz cookie-parser)
    const cookieToken = (req as any).cookies?.cart_token;
    if (cookieToken) return cookieToken;

    return null;
  }

  // GET /cart
  @Get()
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiHeader({ name: 'X-Cart-Token', required: false })
  async getCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-cart-token') xCartToken?: string,
  ) {
    const token = this.extractCartToken(req, xCartToken);

    const customerId = (req.user as any)?.id ?? null;

    const cart = await this.cartsService.getOrCreateCart(customerId, token);

    // jeśli request był guest (bez tokena) -> ustaw cookie
    if (!token && !customerId) {
      res.cookie('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    return cart;
  }

  @Post('items')
  @ApiBearerAuth()
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiHeader({ name: 'X-Cart-Token', required: false })
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-cart-token') xCartToken: string | undefined,
    @Body() dto: AddCartItemDto,
  ) {
    const token = this.extractCartToken(req, xCartToken);


    const customerId = (req.user as any)?.id ?? null;


    const cart = await this.cartsService.getOrCreateCart(customerId, token);

    if (!token) {
      res.cookie('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    await this.cartsService.addItem(cart, dto.productId, dto.qty);

    return this.cartsService.getOrCreateCart(null, cart.token);
  }

  @Patch('items/:id')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiHeader({ name: 'X-Cart-Token', required: false })
  async updateItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-cart-token') xCartToken: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    const token = this.extractCartToken(req, xCartToken);


    const customerId = (req.user as any)?.id ?? null;


    const cart = await this.cartsService.getOrCreateCart(customerId, token);

    if (!token) {
      res.cookie('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    await this.cartsService.updateItem(cart, Number(id), dto.qty);

    return this.cartsService.getOrCreateCart(customerId, cart.token);
  }

  @Delete('items/:id')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiHeader({ name: 'X-Cart-Token', required: false })
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-cart-token') xCartToken: string | undefined,
    @Param('id') id: string,
  ) {
    const token = this.extractCartToken(req, xCartToken);

    const customerId = (req.user as any)?.id ?? null;

    const cart = await this.cartsService.getOrCreateCart(customerId, token);

    if (!token) {
      res.cookie('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    await this.cartsService.removeItem(cart, Number(id));

    return this.cartsService.getOrCreateCart(null, cart.token);
  }

  @Delete('clear')
  @UseGuards(OptionalCustomerJwtGuard)
  @ApiHeader({ name: 'X-Cart-Token', required: false })
  async clear(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Headers('x-cart-token') xCartToken: string | undefined,
  ) {
    const token = this.extractCartToken(req, xCartToken);

    const customerId = (req.user as any)?.id ?? null;

    const cart = await this.cartsService.getOrCreateCart(customerId, token);

    if (!token) {
      res.cookie('cart_token', cart.token, {
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    await this.cartsService.clear(cart);
    return this.cartsService.getOrCreateCart(customerId, cart.token);
  }
}