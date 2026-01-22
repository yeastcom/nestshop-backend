import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { Admin } from './entities/admin.entity';
import { AdminsService } from './admins.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminJwtStrategy } from './admin-jwt.strategy';


function parseExpiresIn(raw: string | undefined): number | StringValue {
  const v = raw?.trim();
  if (!v) return '7d' as StringValue;

  // jeśli ktoś poda np. "3600" => sekundy
  if (/^\d+$/.test(v)) return Number(v);

  // np. "7d", "12h", "15m"
  return v as StringValue;
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.registerAsync({
      useFactory: (): JwtModuleOptions => {
        const secret = process.env.ADMIN_JWT_SECRET;
        if (!secret) throw new Error('ADMIN_JWT_SECRET must be set');
        const expiresIn = (process.env.ADMIN_JWT_EXPIRES_IN ?? '7d') as StringValue;
         return {
          secret,
          signOptions: { expiresIn },
          };
      },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AdminsService, AdminJwtStrategy],
  exports: [AdminsService],
})
export class AdminsModule {}
/*
const expiresIn = process.env.ADMIN_JWT_EXPIRES_IN ?? '7d';
         return {
          secret,
          signOptions: { expiresIn },
          };
*/