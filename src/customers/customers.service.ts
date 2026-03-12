import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Customer) private readonly customersRepo: Repository<Customer>,
    @InjectRepository(CustomerAddress) private readonly addressesRepo: Repository<CustomerAddress>,
  ) {}

  async create(dto: CreateCustomerDto) {
    const exists = await this.customersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists');

    const isGuest = !dto.password;
    const passwordHash = isGuest ? randomUUID() : await bcrypt.hash(dto.password!, 12);

    const customer = this.customersRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: dto.isActive ?? true,
      isGuest: dto.isGuest ?? isGuest,
    });

    const saved = await this.customersRepo.save(customer);

    // nie zwracaj hasha
    const { passwordHash: _, ...safe } = saved as any;
    return safe;
  }

  async findAll() {
    const customers = await this.customersRepo.find({ order: { id: 'ASC' } });
    return customers.map(({ passwordHash, ...rest }) => rest);
  }

  async findAllAddress() {
  return this.addressesRepo.find({
    order: { id: "DESC" },
    relations: { customer: true },
    select: {
      id: true,
      customerId: true,
      type: true,
      company: true,
      vatId: true,
      street: true,
      city: true,
      postalCode: true,
      countryCode: true,
      phone: true,
      isDefault: true,
      customer: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  })
}

  async findOne(id: number) {
    const customer = await this.customersRepo.findOne({
      where: { id },
      relations: { addresses: true },
    });
    if (!customer) throw new NotFoundException('Customer not found');

    const { passwordHash, ...safe } = customer as any;
    return safe;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.customersRepo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.email && dto.email !== customer.email) {
      const exists = await this.customersRepo.findOne({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('Email already exists');
      customer.email = dto.email;
    }

    if (dto.password) {
      customer.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    if (dto.firstName !== undefined) customer.firstName = dto.firstName;
    if (dto.lastName !== undefined) customer.lastName = dto.lastName;
    if (dto.isActive !== undefined) customer.isActive = dto.isActive;
    if (dto.isGuest !== undefined) customer.isGuest = dto.isGuest;

    const saved = await this.customersRepo.save(customer);
    const { passwordHash, ...safe } = saved as any;
    return safe;
  }

  async remove(id: number) {
    const res = await this.customersRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Customer not found');
  }

  // --- Addresses ---

  async listAddresses(customerId: number) {
    await this.assertCustomerExists(customerId);
    return this.addressesRepo.find({
      where: { customerId },
      order: { isDefault: 'DESC', id: 'DESC' },
    });
  }

  async addAddress(customerId: number, dto: CreateAddressDto) {
    await this.assertCustomerExists(customerId);

    return this.dataSource.transaction(async (manager) => {
      // jeśli ustawiasz default, zdejmij default z innych (dla danego type)
      if (dto.isDefault) {
        await manager.update(
          CustomerAddress,
          { customerId, type: dto.type },
          { isDefault: false },
        );
      }

      const address = manager.create(CustomerAddress, {
        customerId,
        type: dto.type,
        street: dto.street,
        city: dto.city,
        postalCode: dto.postalCode,
        countryCode: dto.countryCode.toUpperCase(),
        company: dto.company ?? null,
        vatId: dto.vatId ?? null,
        phone: dto.phone ?? null,
        isDefault: dto.isDefault ?? false,
      });

      return manager.save(CustomerAddress, address);
    });
  }

  async updateAddress(customerId: number, addressId: number, dto: UpdateAddressDto) {
    await this.assertCustomerExists(customerId);

    const address = await this.addressesRepo.findOne({ where: { id: addressId, customerId } });
    if (!address) throw new NotFoundException('Address not found');

    return this.dataSource.transaction(async (manager) => {
      if (dto.isDefault) {
        const type = dto.type ?? address.type;
        await manager.update(
          CustomerAddress,
          { customerId, type },
          { isDefault: false },
        );
      }

      if (dto.type !== undefined) address.type = dto.type;
      if (dto.street !== undefined) address.street = dto.street;
      if (dto.city !== undefined) address.city = dto.city;
      if (dto.postalCode !== undefined) address.postalCode = dto.postalCode;
      if (dto.countryCode !== undefined) address.countryCode = dto.countryCode.toUpperCase();
      if (dto.company !== undefined) address.company = dto.company ?? null;
      if (dto.vatId !== undefined) address.vatId = dto.vatId ?? null;
      if (dto.phone !== undefined) address.phone = dto.phone ?? null;
      if (dto.isDefault !== undefined) address.isDefault = dto.isDefault;

      return manager.save(CustomerAddress, address);
    });
  }

  async removeAddress(customerId: number, addressId: number) {
    await this.assertCustomerExists(customerId);
    const res = await this.addressesRepo.delete({ id: addressId, customerId });
    if (!res.affected) throw new NotFoundException('Address not found');
  }

  private async assertCustomerExists(customerId: number) {
    const exists = await this.customersRepo.exist({ where: { id: customerId } });
    if (!exists) throw new NotFoundException('Customer not found');
  }

  async findByEmailWithPassword(email: string) {
    return this.customersRepo.findOne({ where: { email } });
  }

  async validateLogin(email: string, password: string) {
    const customer = await this.customersRepo.findOne({ where: { email } })
    if (!customer) throw new UnauthorizedException("Invalid credentials")

    if (!customer.isActive) throw new UnauthorizedException("Account not active")

    const ok = await bcrypt.compare(password, customer.passwordHash)
    if (!ok) throw new UnauthorizedException("Invalid credentials")

    // safe (bez hasha)
    const { passwordHash, ...safe } = customer as any
    return safe
  }

  async findByIdSafe(id: number) {
    const customer = await this.customersRepo.findOne({ where: { id }, relations: {addresses: true} })
    if (!customer) return null
    const { passwordHash, ...safe } = customer as any
    return safe
  }
}