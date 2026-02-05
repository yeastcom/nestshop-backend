import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository, IsNull, Not } from "typeorm"
import { MenuItem } from "./entities/menu-item.entity"
import { CreateMenuItemDto } from "./dto/create-menu-item.dto"
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto"

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem) private readonly menuRepo: Repository<MenuItem>,
  ) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem>{
    const parentId = dto.parentId ?? null

    if (parentId) {
      const parent = await this.menuRepo.findOne({ where: { id: parentId } })
      if (!parent) throw new NotFoundException("Parent menu item not found")

      if (parent.parentId) {
        throw new BadRequestException("Only one nesting level allowed (parent cannot have parent)")
      }
    }

    const item = this.menuRepo.create({ ...dto, parentId })
    return this.menuRepo.save(item)
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    const item = await this.menuRepo.findOne({ where: { id } })
    if (!item) throw new NotFoundException("Menu item not found")

    if (dto.parentId !== undefined) {
      const parentId = dto.parentId

      if (parentId === null) {
        item.parentId = null
      } else {
        if (parentId === id) throw new BadRequestException("Item cannot be its own parent")

        const parent = await this.menuRepo.findOne({ where: { id: parentId } })
        if (!parent) throw new NotFoundException("Parent menu item not found")

        if (parent.parentId) {
          throw new BadRequestException("Only one nesting level allowed (parent cannot have parent)")
        }

        item.parentId = parentId
      }
    }

    if (dto.name !== undefined) item.name = dto.name
    if (dto.url !== undefined) item.url = dto.url
    if (dto.position !== undefined) item.position = dto.position
    if (dto.isActive !== undefined) item.isActive = dto.isActive

    return this.menuRepo.save(item)
  }

  // do B2C: drzewko max 1 level
  async publicMenu() {
    const roots = await this.menuRepo.find({
      where: { parentId: IsNull(), isActive: true },
      order: { position: "ASC", id: "ASC" },
      relations: { children: true },
    })

    // odfiltruj nieaktywne dzieci + posortuj
    return roots.map((r) => ({
      ...r,
      children: (r.children ?? [])
        .filter((c) => c.isActive)
        .sort((a, b) => (a.position - b.position) || (a.id - b.id)),
    }))
  }

   async remove(id: number): Promise<void> {
    const res = await this.menuRepo.delete(id);

    if (!res.affected) throw new NotFoundException('Cms not found');
  }

  async findRootItems() {
    return this.menuRepo.find({
      where: { parentId: IsNull() },
      order: { position: "ASC", id: "ASC" },
    })
  }

  async findOne(id: number) {
    const menu = await this.menuRepo.findOne({
      where: { id },
      relations: { children: true },
    });
    if (!menu) throw new NotFoundException('Category not found');
    return menu;
  }
}