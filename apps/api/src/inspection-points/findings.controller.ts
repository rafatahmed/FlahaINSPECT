import { Body, Controller, Get, Header, Inject, Param, ParseUUIDPipe, Post, StreamableFile, UseGuards } from '@nestjs/common';
import { IsInt, IsString, Length, Min } from 'class-validator';
import { sql } from 'drizzle-orm';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { StorageService } from '../storage/storage.service';

class ReleaseDto {
  @IsInt() @Min(1) version!: number;
  @IsString() @Length(1, 4000) summary!: string;
}

@Controller('v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindingsController {
  constructor(@Inject('DB') private readonly db: Db, private readonly storage: StorageService) {}

  @Post('inspection-points/:id/release')
  @Roles('manager')
  async release(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() body: ReleaseDto) {
    const summary = body.summary.trim();
    if (!summary) throw new ApiException(ErrorCode.VALIDATION_ERROR);
    const result = await this.db.execute(sql`
      INSERT INTO released_findings
        (point_id, project_id, source_version, summary, category, latitude, longitude, photo_key, released_by)
      SELECT p.id, p.project_id, p.version, ${summary}, p.category, p.latitude, p.longitude, f.storage_key, ${actor.id}::uuid
      FROM inspection_points p JOIN projects j ON j.id=p.project_id JOIN photos f ON f.inspection_point_id=p.id
      WHERE p.id=${id}::uuid AND p.version=${body.version} AND p.deleted_at IS NULL AND j.deleted_at IS NULL
        AND f.status='ready' AND f.storage_key IS NOT NULL
      FOR SHARE OF p, j, f
      ON CONFLICT (point_id) DO NOTHING RETURNING point_id`);
    if (!result.rows.length) {
      const same = await this.db.execute(sql`SELECT 1 FROM released_findings WHERE point_id=${id}::uuid
        AND source_version=${body.version} AND summary=${summary}`);
      if (!same.rows.length) throw new ApiException(ErrorCode.CONFLICT_VERSION, undefined,
        'Refresh the point. It may already be released, have changed, or still be awaiting its photo.');
    }
    return { released: true };
  }

  @Get('client/projects/:id/findings')
  @Roles('client')
  async findings(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const result = await this.db.execute<{ id: string | null; summary: string; category: string; latitude: number;
      longitude: number; released_at: Date }>(sql`
      SELECT f.point_id AS id,f.summary,f.category,f.latitude,f.longitude,f.released_at
      FROM projects j JOIN project_members m ON m.project_id=j.id
      LEFT JOIN (released_findings f JOIN inspection_points p ON p.id=f.point_id AND p.deleted_at IS NULL)
        ON f.project_id=j.id
      WHERE j.id=${id}::uuid AND j.deleted_at IS NULL AND m.user_id=${actor.id}::uuid
      ORDER BY f.released_at DESC,f.point_id`);
    if (!result.rows.length) throw new ApiException(ErrorCode.NOT_FOUND);
    return { items: result.rows.filter(r => r.id) };
  }

  private async visibleFinding(actor: AuthUser, id: string) {
    const result = await this.db.execute<{
      id: string; project_id: string; summary: string; category: string; released_at: Date; photo_key: string;
    }>(sql`
      SELECT f.point_id AS id, f.project_id, f.summary, f.category, f.released_at, f.photo_key
      FROM released_findings f
      JOIN project_members m ON m.project_id = f.project_id
      JOIN projects j ON j.id = f.project_id AND j.deleted_at IS NULL
      JOIN inspection_points p ON p.id = f.point_id AND p.deleted_at IS NULL
      WHERE f.point_id = ${id}::uuid AND m.user_id = ${actor.id}::uuid
    `);
    if (!result.rows[0]) throw new ApiException(ErrorCode.NOT_FOUND);
    return result.rows[0];
  }

  @Get('client/findings/:id')
  @Roles('client')
  async detail(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const { id: pointId, project_id, summary, category, released_at } = await this.visibleFinding(actor, id);
    return { finding: { id: pointId, project_id, summary, category, released_at } };
  }

  @Get('client/findings/:id/photo')
  @Header('Cache-Control', 'private, no-store')
  @Roles('client')
  async photo(@CurrentUser() actor: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    const row = await this.visibleFinding(actor, id);
    const file = await this.storage.getObject(row.photo_key);
    if (!file) throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    return new StreamableFile(file.body, { type: file.contentType, length: file.contentLength });
  }
}
