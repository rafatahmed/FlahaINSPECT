import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth.types';
import { SyncTelemetryDto } from './sync.dto';
import { SyncService } from './sync.service';

@Controller('v1/sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private readonly sync: SyncService) {}

  @Get('projects')
  projects(
    @CurrentUser() actor: AuthUser,
    @Query('since_updated_at') since_updated_at?: string,
    @Query('since_id') since_id?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sync.projects(actor, { since_updated_at, since_id, limit });
  }

  @Get('projects/:id/points')
  points(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Query('since_updated_at') since_updated_at?: string,
    @Query('since_id') since_id?: string,
    @Query('limit') limit?: string,
  ) {
    return this.sync.points(actor, id, { since_updated_at, since_id, limit });
  }

  @Post('telemetry')
  telemetry(@Body() body: SyncTelemetryDto) {
    return this.sync.telemetry(body);
  }
}
