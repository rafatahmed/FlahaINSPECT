import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, SetPasswordDto } from './auth.dto';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import type { AuthUser } from './auth.types';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto, @Req() req: Request) {
    return this.auth.login({
      email: body.email,
      password: body.password,
      ip: clientIp(req),
    });
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(body.refresh_token, clientIp(req));
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Body() body: RefreshDto): Promise<void> {
    await this.auth.logout(body.refresh_token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  setPassword(@CurrentUser() actor: AuthUser, @Body() body: SetPasswordDto) {
    return this.auth.setPassword(actor, body.user_id, body.new_password);
  }
}

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}
