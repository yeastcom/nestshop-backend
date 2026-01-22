import { Controller, Get, Param, ParseIntPipe} from '@nestjs/common';
import { CmsService } from './cms.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('cms')
@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.findOne(id);
  }
}
