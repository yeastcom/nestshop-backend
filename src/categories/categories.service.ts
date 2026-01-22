import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      const parent = await this.categoriesRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) throw new BadRequestException('Parent category not found');
    }

    const category = this.categoriesRepo.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
      parentId: dto.parentId ?? null,
    });

    return this.categoriesRepo.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: { parent: true, children: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findChildrenCategory(id: number): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: { parentId: id},
      order: { id: "ASC" },
    })
  }

  async findRootCategory(): Promise<Category[]> {
    return this.categoriesRepo.find({
      where: { parentId: IsNull() },
      order: { id: "ASC" },
    })
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        category.parentId = null;
      } else {
        if (dto.parentId === id)
          throw new BadRequestException('Category cannot be its own parent');

        const parent = await this.categoriesRepo.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) throw new BadRequestException('Parent category not found');

        category.parentId = dto.parentId;
      }
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.description !== undefined)
      category.description = dto.description ?? null;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;

    return this.categoriesRepo.save(category);
  }

  async remove(id: number): Promise<void> {
    const res = await this.categoriesRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Category not found');
  }

  async getTree(): Promise<any[]> {
    const categories = await this.categoriesRepo.find({ order: { id: 'ASC' } });

    const byParent = new Map<number | null, Category[]>();
    for (const c of categories) {
      const key = c.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(c);
    }

    const build = (parentId: number | null): any[] =>
      (byParent.get(parentId) ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        isActive: c.isActive,
        parentId: c.parentId,
        children: build(c.id),
      }));

    return build(null);
  }
}
