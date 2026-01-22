import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomersService } from './customers.service';

type CustomerJwtPayload = {
  sub: number;
  email: string;
  type: 'customer';
};

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(private readonly customersService: CustomersService) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is missing');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: CustomerJwtPayload) {
    if (payload?.type !== 'customer') throw new UnauthorizedException();

    // Tu możesz pobrać tylko minimalne dane
    const customer = await this.customersService.findOne(payload.sub);
    if (!customer) throw new UnauthorizedException();

    // To wpadnie do req.user
    return { id: customer.id, email: customer.email };
  }
}