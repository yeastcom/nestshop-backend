import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalCustomerJwtGuard extends AuthGuard('customer-jwt') {
  handleRequest(err: any, user: any) {
    return user ?? null;
  }
}