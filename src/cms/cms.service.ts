import { Injectable, NotFoundException, } from '@nestjs/common';
import { CreateCmsDto } from './dto/create-cms.dto';
import { UpdateCmsDto } from './dto/update-cms.dto';
import { Repository } from 'typeorm';
import { Cms } from './entities/cms.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(Cms)
    private readonly cmsRepo: Repository<Cms>,
  ) { }

  async create(dto: CreateCmsDto): Promise<Cms> {
    const cms = this.cmsRepo.create({
      title: dto.title,
      slug: dto.slug,
      content: dto.content ?? null,
      isActive: dto.isActive ?? true,
    });

    return this.cmsRepo.save(cms);
  }

  async findAll(): Promise<Cms[]> {
    return this.cmsRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Cms> {
    const cms = await this.cmsRepo.findOne({
      where: { id }
    });
    if (!cms) throw new NotFoundException('Cms not found');

    return cms;
  }

  async remove(id: number): Promise<void> {
    const res = await this.cmsRepo.delete(id);

    if (!res.affected) throw new NotFoundException('Cms not found');
  }

  async update(id: number, dto: UpdateCmsDto): Promise<Cms> {
      const cms = await this.cmsRepo.findOne({ where: { id } });
      if (!cms) throw new NotFoundException('Cms not found');
  
      if (dto.title !== undefined) cms.title = dto.title;
      if (dto.slug !== undefined) cms.slug = dto.slug;
      if (dto.content !== undefined)
        cms.content = dto.content ?? null;
      if (dto.isActive !== undefined) cms.isActive = dto.isActive;
  
      return this.cmsRepo.save(cms);
    }
}
