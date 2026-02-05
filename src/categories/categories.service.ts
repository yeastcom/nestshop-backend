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
import { Product } from 'src/products/entities/product.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
    private config: ConfigService
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


  async getProductsByCategory(categoryId: number, opts: { page: number; limit: number }) {
    const { page, limit } = opts
    const skip = (page - 1) * limit

    const category = await this.categoriesRepo.findOne({ where: { id: categoryId } })
    if (!category) throw new NotFoundException("Category not found")
      

    // relacja many-to-many: product.categories
    const [items, total] = await this.productsRepo
    .createQueryBuilder("p")
    .leftJoin("p.categories", "c")
    .where("c.id = :categoryId", { categoryId })
    .andWhere("p.isActive = :active", { active: true })
    .leftJoinAndSelect("p.defaultCategory", "dc")
    .leftJoinAndSelect("p.images", "img", "img.cover = :cover", { cover: true })
    .orderBy("p.id", "DESC")
    .skip(skip)
    .take(limit)
    .getManyAndCount()

    const mapped = items.map((p) => {
      const cover = p.images?.[0] // bo join zwróci max 1
      return {
        ...p,
        images: cover
          ? [
              {
                ...cover,
                urls: this.imageUrls(cover.id),
              },
            ]
          : [],
      }
    })

    return {
      items: mapped,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    }
  }

  private imageSubPath(imageId: number) {
    // np. 164 => "1/6/4"
    return String(imageId).split("").join("/")
  }

  private imageUrls(imageId: number) {
    const dir = `/media/img/p/${this.imageSubPath(imageId)}`

    return {
      original: `${dir}/original.jpg`,
      cart_default: `${dir}/cart_default.jpg`,
      small_default: `${dir}/small_default.jpg`,
      medium_default: `${dir}/medium_default.jpg`,
      home_default: `${dir}/home_default.jpg`,
      large_default: `${dir}/large_default.jpg`,
    }
  }
}
