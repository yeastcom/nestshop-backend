import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

type CustomerJwtPayload = {
  sub: number;
  email: string;
  type: 'customer';
};

@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateCustomerDto) {
    // CustomersService.create() ma: unique email + hash hasła + zwraca bez passwordHash
    const customer = await this.customersService.create(dto);

    const payload: CustomerJwtPayload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      customer,
    };
  }

  async login(email: string, password: string) {
    const customer = await this.customersService.findByEmailWithPassword(email);
    if (!customer) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, customer.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload: CustomerJwtPayload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}