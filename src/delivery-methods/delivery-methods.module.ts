import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { DeliveryMethodsService } from './delivery-methods.service';
import { DeliveryMethodsController } from './delivery-methods.controller';
import { AdminDeliveryMethodsController } from './admin-delivery-methods.controller';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryMethod]), AdminsModule],
  controllers: [DeliveryMethodsController, AdminDeliveryMethodsController],
  providers: [DeliveryMethodsService],
  exports: [DeliveryMethodsService],
})
export class DeliveryMethodsModule {}
