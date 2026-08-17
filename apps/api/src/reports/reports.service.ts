import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, jobs, projectMembers, projects, reports } from '../db/schema';
import { projectAccess } from '../projects/project-access';
import { StorageService } from '../storage/storage.service';
import { assertReportPointCap, canEnqueueReport, canGenerateReport } from './report-policy';

@Injectable()
export class ReportsService {
  constructor(
    @Inject('DB') private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  async create(actor: AuthUser, projectId: string, title?: string) {
    if (!canGenerateReport(actor.role)) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    if (process.env.PDF_ENABLED === 'false') {
      throw new ApiException(ErrorCode.FORBIDDEN, undefined, 'pdf disabled');
    }
    const project = await this.loadProject(projectId);
    const access = projectAccess(actor, project, await this.isMember(actor.id, projectId));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);

    const countRows = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(inspectionPoints)
      .where(and(eq(inspectionPoints.projectId, projectId), isNull(inspectionPoints.deletedAt)));
    const count = Number(countRows[0]?.n ?? 0);
    try {
      assertReportPointCap(count);
    } catch {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, { max: 200, point_count: count });
    }

    const active = await this.db
      .select({ id: reports.id })
      .from(reports)
      .where(and(eq(reports.projectId, projectId), inArray(reports.status, ['queued', 'processing'])))
      .limit(1);
    if (canEnqueueReport(active[0]?.id ?? null) === 'in_progress') {
      throw new ApiException(ErrorCode.REPORT_IN_PROGRESS, { report_id: active[0].id });
    }

    try {
      const [report] = await this.db
        .insert(reports)
        .values({
          projectId,
          requestedBy: actor.id,
          status: 'queued',
          title: title ?? null,
          pointCount: count,
        })
        .returning();
      await this.db.insert(jobs).values({
        type: 'generate_report',
        status: 'pending',
        payload: { report_id: report.id },
      });
      return { status: 202 as const, report: this.publicReport(report, null) };
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === '23505') {
        const again = await this.db
          .select({ id: reports.id })
          .from(reports)
          .where(and(eq(reports.projectId, projectId), inArray(reports.status, ['queued', 'processing'])))
          .limit(1);
        throw new ApiException(ErrorCode.REPORT_IN_PROGRESS, { report_id: again[0]?.id });
      }
      throw err;
    }
  }

  async list(actor: AuthUser, projectId: string) {
    if (!canGenerateReport(actor.role)) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    const project = await this.loadProject(projectId);
    const access = projectAccess(actor, project, await this.isMember(actor.id, projectId));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
    const rows = await this.db
      .select()
      .from(reports)
      .where(eq(reports.projectId, projectId))
      .orderBy(desc(reports.createdAt));
    return { items: rows.map((r) => this.publicReport(r, null)) };
  }

  async get(actor: AuthUser, id: string, ip: string) {
    if (!canGenerateReport(actor.role)) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    const [row] = await this.db.select().from(reports).where(eq(reports.id, id)).limit(1);
    if (!row) throw new ApiException(ErrorCode.NOT_FOUND);
    const project = await this.loadProject(row.projectId);
    const access = projectAccess(actor, project, await this.isMember(actor.id, row.projectId));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
    const download = row.status === 'ready' ? await this.storage.signedReportGet(row.storageKey) : null;
    if (download) {
      await this.db.execute(sql`
        INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, ip)
        VALUES (${actor.id}::uuid, 'report.download', 'report', ${row.id}::uuid, ${ip})
      `);
    }
    return { report: this.publicReport(row, download) };
  }

  private publicReport(
    row: typeof reports.$inferSelect,
    download: { url: string; expires_in: number } | null,
  ) {
    return {
      id: row.id,
      project_id: row.projectId,
      status: row.status,
      title: row.title,
      point_count: row.pointCount,
      generated_at: row.generatedAt?.toISOString() ?? null,
      error_message: row.errorMessage,
      created_at: row.createdAt.toISOString(),
      ...(download
        ? { download_url: download.url, expires_in: download.expires_in }
        : {}),
    };
  }

  private async loadProject(id: string) {
    const [row] = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return row ?? null;
  }

  private async isMember(userId: string, projectId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ userId: projectMembers.userId })
      .from(projectMembers)
      .where(and(eq(projectMembers.userId, userId), eq(projectMembers.projectId, projectId)))
      .limit(1);
    return Boolean(row);
  }
}
