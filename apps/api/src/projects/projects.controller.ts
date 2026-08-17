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
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthUser } from '../auth/auth.types';
import { AddMemberDto, CreateProjectDto, PatchProjectDto } from './projects.dto';
import { ProjectsService } from './projects.service';

@Controller('v1/projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list(@CurrentUser() actor: AuthUser, @Query('archived') archived?: string) {
    return this.projects.list(actor, archived === 'false' ? 'false' : 'all');
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('manager')
  create(@CurrentUser() actor: AuthUser, @Body() body: CreateProjectDto) {
    return this.projects.create(actor, body);
  }

  @Get(':id')
  get(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.projects.get(actor, id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('manager')
  patch(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() body: PatchProjectDto) {
    return this.projects.patch(actor, id, body);
  }

  @Post(':id/archive')
  @UseGuards(RolesGuard)
  @Roles('manager')
  archive(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.projects.archive(actor, id);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('manager')
  remove(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.projects.softDelete(actor, id);
  }

  @Post(':id/members')
  @UseGuards(RolesGuard)
  @Roles('manager')
  addMember(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Body() body: AddMemberDto,
  ) {
    return this.projects.addMember(actor, id, body);
  }

  @Delete(':id/members/:userId')
  @UseGuards(RolesGuard)
  @Roles('manager')
  removeMember(
    @CurrentUser() actor: AuthUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.projects.removeMember(actor, id, userId);
  }

  @Get(':id/stats')
  stats(@CurrentUser() actor: AuthUser, @Param('id') id: string) {
    return this.projects.stats(actor, id);
  }
}
