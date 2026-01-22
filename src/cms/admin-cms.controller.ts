import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, HttpCode, UseGuards } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';
import { ApiTags } from '@nestjs/swagger';
import { AdminSessionGuard } from 'src/admins/guards/admin-session.guard';

@ApiTags('admin-cms')
@UseGuards(AdminSessionGuard)
@Controller('admin/cms')
export class AdminCmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createCmDto: CreateCmsDto) {
    return this.cmsService.create(createCmDto);
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.cmsService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.findOne(id);
  }

  @Put(':id')
  @HttpCode(200)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCmDto: UpdateCmsDto) {
    return this.cmsService.update(id, updateCmDto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.remove(id);
  }
}
