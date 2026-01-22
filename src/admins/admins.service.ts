import { ForbiddenException, Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin) private readonly adminsRepo: Repository<Admin>,
    private readonly jwt: JwtService,
  ) {}

  async validateLogin(email: string, password: string) {
    const admin = await this.adminsRepo.findOne({ where: { email } });
    if (!admin) throw new UnauthorizedException('Invalid credentials');
    if (!admin.isActive) throw new ForbiddenException('Admin is disabled');

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return admin;
  }

  async findById(id: number): Promise<Admin> {
    const admin = await this.adminsRepo.findOne({ where: { id } })
    if (!admin) throw new NotFoundException("Admin not found")
    return admin
  }
}