import { Body, Controller, Get, Post, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminsService } from './admins.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminJwtAuthGuard } from './guards/admin-jwt-auth.guard';

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post("login")
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
  ) {
    const admin = await this.adminsService.validateLogin(dto.email, dto.password);
    if (!admin) throw new UnauthorizedException("Invalid credentials");

    req.session.adminId = admin.id;

    return { ok: true, admin: { id: admin.id, email: admin.email } };
  }

 @Post("logout")
  async logout(@Req() req: Request) {
    return new Promise((resolve) => {
      req.session.destroy(() => {
        req.res?.clearCookie("admin.sid", { path: "/" });
        resolve({ ok: true });
      });
    });
  }

  @Get("me")
  async me(@Req() req: Request) {
    if (!req.session.adminId) throw new UnauthorizedException();
    const admin = await this.adminsService.findById(req.session.adminId);
    return { id: admin.id, email: admin.email };
  }
}