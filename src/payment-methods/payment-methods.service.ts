import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,
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
    if (!method) throw new NotFoundException('Payment method not found');
    return method;
  }

  create(dto: CreatePaymentMethodDto) {
    const method = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
      position: dto.position ?? 0,
    });
    return this.repo.save(method);
  }

  async update(id: number, dto: UpdatePaymentMethodDto) {
    const method = await this.findOne(id);
    if (dto.name !== undefined) method.name = dto.name;
    if (dto.description !== undefined) method.description = dto.description ?? null;
    if (dto.isActive !== undefined) method.isActive = dto.isActive;
    if (dto.position !== undefined) method.position = dto.position;
    return this.repo.save(method);
  }

  async remove(id: number) {
    const method = await this.findOne(id);
    await this.repo.remove(method);
  }
}
