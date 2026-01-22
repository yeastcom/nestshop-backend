import { PartialType } from '@nestjs/swagger';
import { CreateCmsDto } from './create-cms.dto';

export class UpdateCmsDto extends PartialType(CreateCmsDto) {}
