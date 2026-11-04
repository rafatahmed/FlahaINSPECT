import {
  Body,
  HttpCode,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  IsArray,
  ArrayMaxSize,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { sql } from 'drizzle-orm';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthUser } from '../auth/auth.types';
import type { Db } from '../db/client';
import { StorageService } from '../storage/storage.service';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';

class Summary {
  @IsUUID() id!: string;
  @IsString() @MinLength(1) @MaxLength(4000) summary!: string;
}
class Issue {
  @IsUUID() request_id!: string;
  @ArrayMaxSize(200)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Summary)
  summaries!: Summary[];
}

@Controller('v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IssuedReportsController {
  constructor(
    @Inject('DB') private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  private async project(actor: AuthUser, id: string) {
    const result = await this.db.execute<{ name: string }>(sql`
      SELECT name FROM projects p WHERE p.id=${id}::uuid AND p.deleted_at IS NULL
      AND (${actor.role}='manager' OR EXISTS (
        SELECT 1 FROM project_members m WHERE m.project_id=p.id AND m.user_id=${actor.id}::uuid
      ))`);
    if (!result.rows[0]) throw new ApiException(ErrorCode.NOT_FOUND);
    return result.rows[0];
  }

  @Get('projects/:id/issuance-draft')
  @Roles('manager')
  async draft(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const project = await this.project(actor, id);
    const result = await this.db.execute<{
      id: string;
      summary: string;
      category: string;
      photo_key: string;
    }>(sql`
      SELECT f.point_id AS id,f.summary,f.category,f.photo_key FROM released_findings f
      JOIN inspection_points p ON p.id=f.point_id AND p.deleted_at IS NULL
      WHERE f.project_id=${id}::uuid ORDER BY f.released_at,f.point_id`);
    return {
      project,
      items: result.rows.map(({ photo_key: _photoKey, ...finding }) => finding),
    };
  }

  @Post('projects/:id/issued-reports')
  @HttpCode(202)
  @Roles('manager')
  async issue(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Issue,
  ) {
    await this.project(actor, id);
    const existing = await this.db.execute<{
      id: string;
      status: string;
      revision: number;
    }>(sql`
      SELECT id,status,client_revision AS revision FROM reports
      WHERE request_id=${body.request_id}::uuid AND project_id=${id}::uuid`);
    if (existing.rows[0]) return { report: existing.rows[0] };
    const project = await this.project(actor, id);
    const result = await this.db.execute<{
      id: string;
      summary: string;
      category: string;
      photo_key: string;
    }>(sql`
      SELECT f.point_id AS id,f.summary,f.category,f.photo_key FROM released_findings f
      JOIN inspection_points p ON p.id=f.point_id AND p.deleted_at IS NULL
      WHERE f.project_id=${id}::uuid ORDER BY f.released_at,f.point_id`);
    if (!result.rows.length || result.rows.length > 200)
      throw new ApiException(ErrorCode.VALIDATION_ERROR);
    const overrides = new Map(
      body.summaries.map((s) => [s.id, s.summary.trim()]),
    );
    if (
      overrides.size !== body.summaries.length ||
      [...overrides].some(
        ([key, value]) => !value || !result.rows.some((f) => f.id === key),
      )
    ) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR);
    }
    const findings = [];
    let total = 0;
    for (const row of result.rows) {
      const file = await this.storage.getObject(row.photo_key);
      if (!file) throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE);
      const chunks: Buffer[] = [];
      for await (const chunk of file.body) {
        const bytes = Buffer.from(chunk);
        total += bytes.length;
        if (total > 50 * 1024 * 1024) {
          file.body.destroy();
          throw new ApiException(
            ErrorCode.VALIDATION_ERROR,
            undefined,
            'Report evidence exceeds 50 MB',
          );
        }
        chunks.push(bytes);
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.contentType))
        throw new ApiException(ErrorCode.VALIDATION_ERROR);
      findings.push({
        id: row.id,
        category: row.category,
        summary: overrides.get(row.id) ?? row.summary,
        image: `data:${file.contentType};base64,${Buffer.concat(chunks).toString('base64')}`,
      });
    }
    const snapshot = {
      project: project.name,
      issued_at: new Date().toISOString(),
      findings,
    };
    return this.db.transaction(async (tx) => {
      const locked = await tx.execute(
        sql`SELECT id FROM projects WHERE id=${id}::uuid AND deleted_at IS NULL FOR UPDATE`,
      );
      if (!locked.rows.length) throw new ApiException(ErrorCode.NOT_FOUND);
      const previous = await tx.execute<{
        id: string;
        status: string;
        revision: number;
      }>(sql`
        SELECT id,status,client_revision AS revision FROM reports WHERE request_id=${body.request_id}::uuid AND project_id=${id}::uuid`);
      if (previous.rows[0]) return { report: previous.rows[0] };
      const active = await tx.execute(
        sql`SELECT id FROM reports WHERE project_id=${id}::uuid AND status IN ('queued','processing')`,
      );
      if (active.rows.length)
        throw new ApiException(ErrorCode.REPORT_IN_PROGRESS);
      const inserted = await tx.execute<{
        id: string;
        status: string;
        revision: number;
      }>(sql`
        INSERT INTO reports(project_id,requested_by,title,status,point_count,filters_json,client_revision,request_id)
        SELECT ${id}::uuid,${actor.id}::uuid,'Issued client report','queued',${findings.length},${JSON.stringify(snapshot)}::jsonb,
          COALESCE(MAX(client_revision),0)+1,${body.request_id}::uuid FROM reports WHERE project_id=${id}::uuid
        RETURNING id,status,client_revision AS revision`);
      const report = inserted.rows[0];
      await tx.execute(
        sql`INSERT INTO jobs(type,payload) VALUES ('generate_report',${JSON.stringify({ report_id: report.id })}::jsonb)`,
      );
      return { report };
    });
  }

  @Get('client/projects/:id/reports')
  @Roles('client')
  async list(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.project(actor, id);
    const result = await this.db
      .execute(sql`SELECT id,client_revision AS revision,generated_at,point_count FROM reports
      WHERE project_id=${id}::uuid AND client_revision IS NOT NULL AND status='ready' ORDER BY client_revision DESC`);
    return { items: result.rows };
  }

  @Get('client/reports/:id')
  @Roles('client')
  async detail(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.db.execute<{
      id: string;
      project_id: string;
      revision: number;
      generated_at: Date;
    }>(sql`
      SELECT id,project_id,client_revision AS revision,generated_at FROM reports
      WHERE id=${id}::uuid AND client_revision IS NOT NULL AND status='ready'`);
    const row = result.rows[0];
    if (!row) throw new ApiException(ErrorCode.NOT_FOUND);
    await this.project(actor, row.project_id);
    return { report: row };
  }

  @Get('client/reports/:id/file')
  @Roles('client')
  async file(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.db.execute<{
      project_id: string;
      storage_key: string;
    }>(sql`
      SELECT project_id,storage_key FROM reports WHERE id=${id}::uuid AND client_revision IS NOT NULL AND status='ready'`);
    const row = result.rows[0];
    if (!row) throw new ApiException(ErrorCode.NOT_FOUND);
    await this.project(actor, row.project_id);
    const file = await this.storage.getObject(row.storage_key);
    if (!file) throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    return new StreamableFile(file.body, {
      type: 'application/pdf',
      length: file.contentLength,
    });
  }
}
