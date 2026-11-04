import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import { InspectionSessionsService } from './inspection-sessions.service';
import {
  EndSessionDto,
  CloseSessionDto,
  RegisterSessionDto,
  SessionSyncDto,
} from './inspection-sessions.dto';
@Controller('v1')
@UseGuards(JwtAuthGuard)
export class InspectionSessionsController {
  constructor(private readonly sessions: InspectionSessionsService) {}
  @Post('inspection-sessions') register(
    @CurrentUser() actor: AuthUser,
    @Body() body: RegisterSessionDto,
  ) {
    return this.sessions.register(actor, body);
  }
  @Post('inspection-sessions/:id/close')
  close(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: CloseSessionDto,
  ) {
    return this.sessions.close(actor, id, body);
  }
  @Post('inspection-sessions/:id/end') end(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: EndSessionDto,
  ) {
    return this.sessions.end(actor, id, body);
  }
  @Post('inspection-sessions/:id/sync-state') sync(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: SessionSyncDto,
  ) {
    return this.sessions.syncState(actor, id, body);
  }
  @Get('projects/:id/inspection-sessions') list(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sessions.list(actor, id);
  }
}
