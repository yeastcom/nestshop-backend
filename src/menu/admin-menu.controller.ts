import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, ParseIntPipe, HttpCode } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';
import {
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('admin-menu')
@UseGuards(AdminSessionGuard)
@Controller('admin/menu')
export class AdminMenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuItemDto) {
    return this.menuService.create(createMenuDto);
  }

  @Get()
  findRootItems() {
    return this.menuService.findRootItems();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateMenuDto: UpdateMenuItemDto) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }
}
