import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { AdminCmsController } from './admin-cms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cms } from './entities/cms.entity';

@Module({
  controllers: [CmsController, AdminCmsController],
  providers: [CmsService],
  imports: [TypeOrmModule.forFeature([Cms])],
})
export class CmsModule {}
