import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import type { Request } from "express"

@Injectable()
export class CustomerAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>()

    if (!req.session || !req.session.customerId) {
      throw new UnauthorizedException("Customer not logged in")
    }

    return true
  }
}