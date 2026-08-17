import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, isNull, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, photos, projectMembers, projects } from '../db/schema';
import { asGeoJson, geomFromGeoJson, parsePolygon } from './geo';
import { canMutateProject, projectAccess } from './project-access';
import { normalizeName, normalizeProjectCode } from '../users/user-rules';

type ProjectRow = typeof projects.$inferSelect;

@Injectable()
export class ProjectsService {
  constructor(@Inject('DB') private readonly db: Db) {}

  async list(actor: AuthUser, archived: 'all' | 'false' = 'all') {
    const live = await this.db.select().from(projects).where(isNull(projects.deletedAt));
    const memberships = await this.memberIds(actor.id);
    const visible = live.filter((row) => {
      if (archived === 'false' && row.isArchived) return false;
      return projectAccess(actor, row, memberships.has(row.id)) === 'ok';
    });
    return { items: visible.map((row) => this.toPublic(row)) };
  }

  async get(actor: AuthUser, id: string) {
    const project = await this.requireProject(actor, id);
    const members = await this.db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.projectId, id));
    return {
      project: this.toPublic(project),
      members: members.map((m) => ({
        user_id: m.userId,
        member_role: m.memberRole,
        created_at: m.createdAt.toISOString(),
      })),
    };
  }

  async create(
    actor: AuthUser,
    input: {
      name: string;
      code?: string;
      description?: string;
      boundary?: unknown;
      bbox?: unknown;
    },
  ) {
    this.assertManager(actor);
    const values: Record<string, unknown> = {
      name: normalizeName(input.name),
      code: normalizeProjectCode(input.code),
      description: input.description ?? null,
      createdBy: actor.id,
    };
    if (input.boundary) {
      values.boundary = geomFromGeoJson(parsePolygon(input.boundary, 'boundary'));
    } else if (input.bbox) {
      values.bbox = geomFromGeoJson(parsePolygon(input.bbox, 'bbox'));
    }
    const [created] = await this.db
      .insert(projects)
      .values(values as typeof projects.$inferInsert)
      .returning();
    return { project: await this.reloadPublic(created.id) };
  }

  async patch(
    actor: AuthUser,
    id: string,
    input: {
      name?: string;
      code?: string;
      description?: string;
      boundary?: unknown;
      bbox?: unknown;
    },
  ) {
    this.assertManager(actor);
    await this.requireProject(actor, id);
    const patch: Record<string, unknown> = {};
    if (input.name !== undefined) patch.name = normalizeName(input.name);
    if (input.code !== undefined) patch.code = normalizeProjectCode(input.code);
    if (input.description !== undefined) patch.description = input.description;
    if (input.boundary) {
      patch.boundary = geomFromGeoJson(parsePolygon(input.boundary, 'boundary'));
    }
    if (input.bbox && !input.boundary) {
      patch.bbox = geomFromGeoJson(parsePolygon(input.bbox, 'bbox'));
    }
    if (Object.keys(patch).length === 0) {
      return { project: await this.reloadPublic(id) };
    }
    await this.db.update(projects).set(patch).where(eq(projects.id, id));
    return { project: await this.reloadPublic(id) };
  }

  async archive(actor: AuthUser, id: string) {
    this.assertManager(actor);
    await this.requireProject(actor, id);
    await this.db.update(projects).set({ isArchived: true }).where(eq(projects.id, id));
    return { project: await this.reloadPublic(id) };
  }

  async softDelete(actor: AuthUser, id: string) {
    this.assertManager(actor);
    await this.requireProject(actor, id);
    await this.db.update(projects).set({ deletedAt: new Date() }).where(eq(projects.id, id));
    return { ok: true as const };
  }

  async addMember(
    actor: AuthUser,
    projectId: string,
    input: { user_id: string; member_role?: 'inspector' | 'manager' | 'client' },
  ) {
    this.assertManager(actor);
    await this.requireProject(actor, projectId);
    await this.db
      .insert(projectMembers)
      .values({
        projectId,
        userId: input.user_id,
        memberRole: input.member_role ?? 'inspector',
      })
      .onConflictDoNothing();
    return this.get(actor, projectId);
  }

  async removeMember(actor: AuthUser, projectId: string, userId: string) {
    this.assertManager(actor);
    await this.requireProject(actor, projectId);
    await this.db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)));
    return { ok: true as const };
  }

  async stats(actor: AuthUser, id: string) {
    await this.requireProject(actor, id);
    const [pointRow] = await this.db
      .select({ n: count() })
      .from(inspectionPoints)
      .where(and(eq(inspectionPoints.projectId, id), isNull(inspectionPoints.deletedAt)));
    const categories = await this.db
      .select({
        category: inspectionPoints.category,
        n: count(),
      })
      .from(inspectionPoints)
      .where(and(eq(inspectionPoints.projectId, id), isNull(inspectionPoints.deletedAt)))
      .groupBy(inspectionPoints.category);
    const statuses = await this.db
      .select({
        status: inspectionPoints.status,
        n: count(),
      })
      .from(inspectionPoints)
      .where(and(eq(inspectionPoints.projectId, id), isNull(inspectionPoints.deletedAt)))
      .groupBy(inspectionPoints.status);
    const [photoRow] = await this.db
      .select({ n: count() })
      .from(photos)
      .where(and(eq(photos.projectId, id), eq(photos.status, 'ready')));
    return {
      point_count: Number(pointRow?.n ?? 0),
      photos_ready: Number(photoRow?.n ?? 0),
      by_category: Object.fromEntries(categories.map((r) => [r.category, Number(r.n)])),
      by_status: Object.fromEntries(statuses.map((r) => [r.status, Number(r.n)])),
    };
  }

  private assertManager(actor: AuthUser): void {
    if (!canMutateProject(actor)) {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
  }

  private async requireProject(actor: AuthUser, id: string): Promise<ProjectRow> {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    const memberships = await this.memberIds(actor.id);
    const access = projectAccess(actor, rows[0] ?? null, memberships.has(id));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
    return rows[0];
  }

  private async memberIds(userId: string): Promise<Set<string>> {
    const rows = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    return new Set(rows.map((r) => r.projectId));
  }

  private async reloadPublic(id: string) {
    const [row] = await this.db
      .select({
        id: projects.id,
        name: projects.name,
        code: projects.code,
        description: projects.description,
        isArchived: projects.isArchived,
        createdBy: projects.createdBy,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        deletedAt: projects.deletedAt,
        boundaryJson: sql<string | null>`ST_AsGeoJSON(${projects.boundary})`,
        bboxJson: sql<string | null>`ST_AsGeoJSON(${projects.bbox})`,
      })
      .from(projects)
      .where(eq(projects.id, id));
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      is_archived: row.isArchived,
      created_by: row.createdBy,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
      boundary: asGeoJson(row.boundaryJson),
      bbox: asGeoJson(row.bboxJson),
    };
  }

  private toPublic(row: ProjectRow) {
    return {
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      is_archived: row.isArchived,
      created_by: row.createdBy,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
      deleted_at: row.deletedAt ? row.deletedAt.toISOString() : null,
    };
  }
}
