import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthUser } from '../auth/auth.types';
import { CreateReportDto } from './reports.dto';
import { ReportsService } from './reports.service';

@Controller('v1')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('manager')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post('projects/:projectId/reports')
  async create(
    @CurrentUser() actor: AuthUser,
    @Param('projectId') projectId: string,
    @Body() body: CreateReportDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.reports.create(actor, projectId, body?.title);
    res.status(result.status);
    return { report: result.report };
  }

  @Get('projects/:projectId/reports')
  list(@CurrentUser() actor: AuthUser, @Param('projectId') projectId: string) {
    return this.reports.list(actor, projectId);
  }

  @Get('reports/:id')
  get(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Req() req: Request) {
    return this.reports.get(actor, id, req.ip ?? 'unknown');
  }
}
