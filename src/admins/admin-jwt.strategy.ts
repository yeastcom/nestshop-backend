import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from './admins.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private readonly adminsService: AdminsService) {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) throw new Error('ADMIN_JWT_SECRET must be set');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload?.sub) throw new UnauthorizedException('Invalid token');

    const admin = await this.adminsService.findById(payload.sub);
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid token');

    return { id: admin.id, email: admin.email };
  }
}