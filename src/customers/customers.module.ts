import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';

import { Customer } from './entities/customer.entity';
import { CustomerAddress } from './entities/customer-address.entity';

import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './customer-jwt.strategy';
import { AdminCustomersController } from './admin-customer.controller';

@Module({
  imports: [
    ConfigModule, // (globalny też może być, ale tu nie zaszkodzi)
    TypeOrmModule.forFeature([Customer, CustomerAddress]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is missing');

        const expiresIn = (config.get<string>('JWT_EXPIRES_IN') ?? '7d') as StringValue;

        return {
          secret,
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [CustomersController, CustomerAuthController, AdminCustomersController],
  providers: [CustomersService, CustomerAuthService, CustomerJwtStrategy],
  exports: [CustomersService],
})
export class CustomersModule {}