import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthUser } from '../auth/auth.types';
import type { Db } from '../db/client';

@Controller('v1/client/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('client')
export class ClientProjectsController {
  constructor(@Inject('DB') private readonly db: Db) {}

  @Get()
  async list(@CurrentUser() actor: AuthUser) {
    const result = await this.db.execute(sql`
      SELECT p.id, p.name, p.code, p.is_archived
      FROM projects p JOIN project_members m ON m.project_id = p.id
      WHERE m.user_id = ${actor.id}::uuid AND p.deleted_at IS NULL
      ORDER BY p.name, p.id
    `);
    return { items: result.rows };
  }
}
