import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import { CreateInspectionPointDto, PatchInspectionPointDto } from './inspection-points.dto';
import { InspectionPointsService } from './inspection-points.service';

@Controller('v1/inspection-points')
@UseGuards(JwtAuthGuard)
export class InspectionPointsController {
  constructor(private readonly points: InspectionPointsService) {}

  @Post()
  async create(
    @CurrentUser() actor: AuthUser,
    @Body() body: CreateInspectionPointDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.points.create(actor, body);
    res.status(result.status);
    return { point: result.point };
  }

  @Get()
  list(
    @CurrentUser() actor: AuthUser,
    @Query('project_id') project_id: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('bbox') bbox?: string,
    @Query('limit') limit?: string,
  ) {
    if (!project_id) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'project_id is required');
    }
    return this.points.list(actor, { project_id, category, status, bbox, limit });
  }

  @Get('by-client/:clientUuid')
  getByClient(@CurrentUser() actor: AuthUser, @Param('clientUuid') clientUuid: string) {
    return this.points.getByClient(actor, clientUuid);
  }

  @Get(':id')
  get(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.points.get(actor, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  patch(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() body: PatchInspectionPointDto,
  ) {
    return this.points.patch(actor, id, body);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('manager')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.points.softDelete(actor, id);
  }
}
