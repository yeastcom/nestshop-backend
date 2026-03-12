import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryMethod } from './entities/delivery-method.entity';
import { CreateDeliveryMethodDto } from './dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from './dto/update-delivery-method.dto';

@Injectable()
export class DeliveryMethodsService {
  constructor(
    @InjectRepository(DeliveryMethod)
    private readonly repo: Repository<DeliveryMethod>,
  ) {}

  findAllActive() {
    return this.repo.find({
      where: { isActive: true },
      order: { position: 'ASC', id: 'ASC' },
    });
  }

  findAll() {
    return this.repo.find({ order: { position: 'ASC', id: 'ASC' } });
  }

  async findOne(id: number) {
    const method = await this.repo.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Delivery method not found');
    return method;
  }

  create(dto: CreateDeliveryMethodDto) {
    const method = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      isActive: dto.isActive ?? true,
      position: dto.position ?? 0,
    });
    return this.repo.save(method);
  }

  async update(id: number, dto: UpdateDeliveryMethodDto) {
    const method = await this.findOne(id);
    if (dto.name !== undefined) method.name = dto.name;
    if (dto.description !== undefined) method.description = dto.description ?? null;
    if (dto.price !== undefined) method.price = dto.price;
    if (dto.isActive !== undefined) method.isActive = dto.isActive;
    if (dto.position !== undefined) method.position = dto.position;
    return this.repo.save(method);
  }

  async remove(id: number) {
    const method = await this.findOne(id);
    await this.repo.remove(method);
  }
}
