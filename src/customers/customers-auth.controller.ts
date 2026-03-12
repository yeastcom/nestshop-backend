import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common"
import { ApiTags } from "@nestjs/swagger"
import type { Request, Response } from "express"
import { CustomersService } from "./customers.service"
import { CustomerLoginDto } from "./dto/customer-login.dto"
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerAuthGuard } from "./guards/customer-auth.guard"

const GUEST_COOKIE = "customer.guest"
const cookieOpts = { httpOnly: false, sameSite: "lax" as const, path: "/" }

@ApiTags("customer-auth")
@Controller("auth")
export class CustomersAuthController {
  constructor(private readonly customersService: CustomersService) {}

  @Post("register")
  async register(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() dto: CreateCustomerDto) {
    const created = await this.customersService.create({
      email: dto.email,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
    })

    req.session.customerId = created.id

    if (created.isGuest) {
      res.cookie(GUEST_COOKIE, "1", cookieOpts)
    } else {
      res.clearCookie(GUEST_COOKIE, { path: "/" })
    }

    return created
  }

  @Post("login")
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() dto: CustomerLoginDto) {
    const customer = await this.customersService.validateLogin(dto.email, dto.password)
    req.session.customerId = customer.id
    res.clearCookie(GUEST_COOKIE, { path: "/" })
    return customer
  }

  @Post("logout")
  @UseGuards(CustomerAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await new Promise<void>((resolve) => req.session.destroy(() => resolve()))
    res.clearCookie("customer.sid")
    res.clearCookie(GUEST_COOKIE, { path: "/" })
    return { ok: true }
  }

  @Get("me")
  @UseGuards(CustomerAuthGuard)
  async me(@Req() req: Request) {
    const id = req.session.customerId
    if (!id) throw new UnauthorizedException()

    const customer = await this.customersService.findByIdSafe(id)
    if (!customer) throw new UnauthorizedException()

    return customer
  }

  @Post("me")
  @UseGuards(CustomerAuthGuard)
  async updateMe(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Body() dto: UpdateCustomerDto) {
    const id = req.session.customerId
    if (!id) throw new UnauthorizedException()

    const updated = await this.customersService.update(id, dto)

    if (dto.isGuest === false) {
      res.clearCookie(GUEST_COOKIE, { path: "/" })
    }

    return updated
  }
}
