import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { AdminMenuController } from './admin-menu.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';

@Module({
  controllers: [MenuController, AdminMenuController],
  providers: [MenuService],
  imports: [TypeOrmModule.forFeature([MenuItem])],
})
export class MenuModule {}
