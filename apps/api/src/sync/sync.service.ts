import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, photos, projectMembers, projects } from '../db/schema';
import { asGeoJson } from '../projects/geo';
import { projectAccess } from '../projects/project-access';
import { keysetAfter, parseDeltaQuery, splitDeltaPage } from './keyset';

@Injectable()
export class SyncService {
  constructor(@Inject('DB') private readonly db: Db) {}

  async projects(
    actor: AuthUser,
    query: { since_updated_at?: string; since_id?: string; limit?: string },
  ) {
    const cursor = parseDeltaQuery(query);
    const memberships = await this.memberIds(actor.id);
    const filters = [keysetAfter(projects.updatedAt, projects.id, cursor.sinceUpdatedAt, cursor.sinceId)];
    if (actor.role !== 'manager') {
      if (memberships.size === 0) {
        return this.emptyPage();
      }
      filters.push(inArray(projects.id, [...memberships]));
    }

    const rows = await this.db
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
      .where(and(...filters))
      .orderBy(asc(projects.updatedAt), asc(projects.id))
      .limit(cursor.limit + 1);

    const split = splitDeltaPage(rows, cursor.limit);
    return {
      server_time: new Date().toISOString(),
      items: split.items.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        is_archived: row.isArchived,
        created_by: row.createdBy,
        created_at: row.createdAt.toISOString(),
        updated_at: row.updatedAt.toISOString(),
        boundary: asGeoJson(row.boundaryJson),
        bbox: asGeoJson(row.bboxJson),
      })),
      deleted_ids: split.deleted_ids,
      next_cursor: split.next_cursor,
      has_more: split.has_more,
    };
  }

  async points(
    actor: AuthUser,
    projectId: string,
    query: { since_updated_at?: string; since_id?: string; limit?: string },
  ) {
    await this.assertProjectAccess(actor, projectId);
    const cursor = parseDeltaQuery(query);
    const rows = await this.db
      .select()
      .from(inspectionPoints)
      .where(
        and(
          eq(inspectionPoints.projectId, projectId),
          keysetAfter(
            inspectionPoints.updatedAt,
            inspectionPoints.id,
            cursor.sinceUpdatedAt,
            cursor.sinceId,
          ),
        ),
      )
      .orderBy(asc(inspectionPoints.updatedAt), asc(inspectionPoints.id))
      .limit(cursor.limit + 1);

    const split = splitDeltaPage(rows, cursor.limit);
    const photoByPoint = await this.photosFor(split.items.map((row) => row.id));
    return {
      server_time: new Date().toISOString(),
      items: split.items.map((row) => ({
        id: row.id,
        client_uuid: row.clientUuid,
        project_id: row.projectId,
        inspector_id: row.inspectorId,
        category: row.category,
        note: row.note,
        remarks: row.remarks,
        recommended_procedure: row.recommendedProcedure,
        status: row.status,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracy_m: row.accuracyM,
        altitude_m: row.altitudeM,
        heading_deg: row.headingDeg,
        location_source: row.locationSource,
        location_adjusted: row.locationAdjusted,
        outside_boundary: row.outsideBoundary,
        captured_at: row.capturedAt.toISOString(),
        version: row.version,
        updated_at: row.updatedAt.toISOString(),
        photos: photoByPoint.get(row.id) ?? [],
      })),
      deleted_ids: split.deleted_ids,
      next_cursor: split.next_cursor,
      has_more: split.has_more,
    };
  }

  telemetry(body: { events: unknown[] }) {
    return { ok: true as const, accepted: body.events.length };
  }

  private emptyPage() {
    return {
      server_time: new Date().toISOString(),
      items: [] as unknown[],
      deleted_ids: [] as string[],
      next_cursor: null,
      has_more: false,
    };
  }

  private async photosFor(pointIds: string[]) {
    const map = new Map<
      string,
      Array<{
        id: string;
        client_uuid: string;
        status: string;
        sha256: string;
        byte_size: number;
        content_type: string;
      }>
    >();
    if (pointIds.length === 0) return map;
    const rows = await this.db.select().from(photos).where(inArray(photos.inspectionPointId, pointIds));
    for (const row of rows) {
      const list = map.get(row.inspectionPointId) ?? [];
      list.push({
        id: row.id,
        client_uuid: row.clientUuid,
        status: row.status,
        sha256: row.sha256,
        byte_size: row.byteSize,
        content_type: row.contentType,
      });
      map.set(row.inspectionPointId, list);
    }
    return map;
  }

  private async assertProjectAccess(actor: AuthUser, projectId: string) {
    const rows = await this.db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    const memberships = await this.memberIds(actor.id);
    const access = projectAccess(actor, rows[0] ?? null, memberships.has(projectId));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
  }

  private async memberIds(userId: string): Promise<Set<string>> {
    const rows = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    return new Set(rows.map((r) => r.projectId));
  }
}
