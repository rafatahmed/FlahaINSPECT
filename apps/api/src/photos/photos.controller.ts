import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { RegisterPhotoDto } from './photos.dto';
import { PhotosService } from './photos.service';

@Controller('v1/photos')
@UseGuards(JwtAuthGuard)
export class PhotosController {
  constructor(private readonly photos: PhotosService) {}

  @Post()
  async register(
    @CurrentUser() actor: AuthUser,
    @Body() body: RegisterPhotoDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.photos.register(actor, body, req.ip ?? 'unknown');
    res.status(result.status);
    return { photo: result.photo };
  }

  @Get(':id')
  async get(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Req() req: Request) {
    const photo = await this.photos.get(actor, id, req.ip ?? 'unknown');
    return { photo };
  }
}
