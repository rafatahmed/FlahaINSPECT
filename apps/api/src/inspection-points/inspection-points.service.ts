import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, photos, projectMembers, projects } from '../db/schema';
import { projectAccess } from '../projects/project-access';
import { StorageService } from '../storage/storage.service';
import { recordSyncLag } from '../metrics/registry';
import { allowlistDeviceInfo, fieldPayloadEqual } from './field-payload';

@Injectable()
export class InspectionPointsService {
  constructor(
    @Inject('DB') private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  async create(actor: AuthUser, input: CreateInput) {
    const project = await this.loadProject(input.project_id);
    const memberships = await this.memberIds(actor.id);
    const access = projectAccess(actor, project, memberships.has(input.project_id));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
    if (project.isArchived) throw new ApiException(ErrorCode.PROJECT_ARCHIVED);

    const capturedAt = new Date(input.captured_at);
    const note = input.note ?? null;
    const locationSource = input.location_source ?? 'phone_gps';
    const locationAdjusted = input.location_adjusted ?? false;
    const device = allowlistDeviceInfo(input.client_device_info);

    const inserted = await this.db.execute<{ id: string }>(sql`
      INSERT INTO inspection_points (
        client_uuid, project_id, inspector_id, category, note,
        location, latitude, longitude, accuracy_m, altitude_m, heading_deg,
        location_source, location_adjusted, captured_at, client_device_info, outside_boundary
      ) VALUES (
        ${input.client_uuid}::uuid,
        ${input.project_id}::uuid,
        ${actor.id}::uuid,
        ${input.category}::point_category,
        ${note},
        ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326)::geography,
        ${input.latitude},
        ${input.longitude},
        ${input.accuracy_m ?? null},
        ${input.altitude_m ?? null},
        ${input.heading_deg ?? null},
        ${locationSource},
        ${locationAdjusted},
        ${capturedAt.toISOString()}::timestamptz,
        ${device ? JSON.stringify(device) : null}::jsonb,
        CASE
          WHEN (SELECT boundary FROM projects WHERE id = ${input.project_id}::uuid) IS NULL THEN FALSE
          WHEN ST_Intersects(
            ST_SetSRID(ST_MakePoint(${input.longitude}, ${input.latitude}), 4326),
            (SELECT boundary FROM projects WHERE id = ${input.project_id}::uuid)
          ) THEN FALSE
          ELSE TRUE
        END
      )
      ON CONFLICT (client_uuid) DO NOTHING
      RETURNING id
    `);

    const newId = firstId(inserted);
    if (newId) {
      recordSyncLag((Date.now() - capturedAt.getTime()) / 1000);
      return { status: 201 as const, point: await this.loadPublic(newId) };
    }

    const existing = await this.db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.clientUuid, input.client_uuid))
      .limit(1);
    const row = existing[0];
    if (!row) {
      throw new ApiException(ErrorCode.DEPENDENCY_UNAVAILABLE);
    }
    const same = fieldPayloadEqual(
      {
        projectId: row.projectId,
        inspectorId: row.inspectorId,
        category: row.category,
        note: row.note,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracyM: row.accuracyM,
        capturedAt: row.capturedAt,
        locationAdjusted: row.locationAdjusted,
        locationSource: row.locationSource,
      },
      {
        projectId: input.project_id,
        inspectorId: actor.id,
        category: input.category,
        note,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracyM: input.accuracy_m ?? null,
        capturedAt,
        locationAdjusted,
        locationSource,
      },
    );
    if (!same) {
      throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
    }
    return { status: 200 as const, point: await this.loadPublic(row.id) };
  }

  async get(actor: AuthUser, id: string) {
    const row = await this.requirePoint(actor, id);
    return { point: await this.loadPublic(row.id) };
  }

  async getByClient(actor: AuthUser, clientUuid: string) {
    const rows = await this.db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.clientUuid, clientUuid))
      .limit(1);
    if (!rows[0] || rows[0].deletedAt) {
      throw new ApiException(ErrorCode.NOT_FOUND);
    }
    await this.assertProjectAccess(actor, rows[0].projectId);
    return { point: await this.loadPublic(rows[0].id) };
  }

  async list(
    actor: AuthUser,
    query: {
      project_id: string;
      category?: string;
      status?: string;
      bbox?: string;
      limit?: string;
    },
  ) {
    await this.assertProjectAccess(actor, query.project_id);
    const limit = clampLimit(query.limit);
    const filters = [
      eq(inspectionPoints.projectId, query.project_id),
      isNull(inspectionPoints.deletedAt),
    ];
    if (query.category) {
      filters.push(eq(inspectionPoints.category, query.category as never));
    }
    if (query.status) {
      filters.push(eq(inspectionPoints.status, query.status as never));
    }
    if (query.bbox) {
      const parts = query.bbox.split(',').map(Number);
      if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
        throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'bbox must be minLon,minLat,maxLon,maxLat');
      }
      const [minLon, minLat, maxLon, maxLat] = parts;
      filters.push(
        sql`location && ST_MakeEnvelope(${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326)::geography`,
      );
    }
    const rows = await this.db
      .select({ id: inspectionPoints.id })
      .from(inspectionPoints)
      .where(and(...filters))
      .orderBy(desc(inspectionPoints.capturedAt))
      .limit(limit);
    const items = [];
    for (const row of rows) {
      items.push(await this.loadPublic(row.id));
    }
    return { items };
  }

  async patch(
    actor: AuthUser,
    id: string,
    input: {
      version: number;
      remarks?: string | null;
      recommended_procedure?: string | null;
      status?: 'open' | 'in_progress' | 'resolved' | 'closed' | 'acknowledged';
    },
  ) {
    if (actor.role !== 'manager') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    const row = await this.requirePoint(actor, id);
    if (row.version !== input.version) {
      throw new ApiException(ErrorCode.CONFLICT_VERSION, { current_version: row.version });
    }
    await this.db
      .update(inspectionPoints)
      .set({
        ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
        ...(input.recommended_procedure !== undefined
          ? { recommendedProcedure: input.recommended_procedure }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        version: row.version + 1,
      })
      .where(eq(inspectionPoints.id, id));
    return { point: await this.loadPublic(id) };
  }

  async softDelete(actor: AuthUser, id: string) {
    if (actor.role !== 'manager') {
      throw new ApiException(ErrorCode.FORBIDDEN);
    }
    await this.requirePoint(actor, id);
    await this.db
      .update(inspectionPoints)
      .set({ deletedAt: new Date() })
      .where(eq(inspectionPoints.id, id));
    return { ok: true as const };
  }

  private async requirePoint(actor: AuthUser, id: string) {
    const rows = await this.db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.id, id))
      .limit(1);
    if (!rows[0] || rows[0].deletedAt) {
      throw new ApiException(ErrorCode.NOT_FOUND);
    }
    await this.assertProjectAccess(actor, rows[0].projectId);
    return rows[0];
  }

  private async assertProjectAccess(actor: AuthUser, projectId: string) {
    const project = await this.loadProject(projectId);
    const memberships = await this.memberIds(actor.id);
    const access = projectAccess(actor, project, memberships.has(projectId));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
  }

  private async loadProject(id: string) {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ?? null;
  }

  private async memberIds(userId: string): Promise<Set<string>> {
    const rows = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    return new Set(rows.map((r) => r.projectId));
  }

  private async loadPublic(id: string) {
    const [row] = await this.db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.id, id));
    const photoRows = await this.db
      .select()
      .from(photos)
      .where(eq(photos.inspectionPointId, id));
    return {
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
      photos: await Promise.all(
        photoRows.map(async (p) => {
          const full = p.status === 'ready' ? await this.storage.signedGet(p.storageKey) : null;
          const thumb = p.status === 'ready' ? await this.storage.signedGet(p.thumbnailKey) : null;
          return {
            id: p.id,
            client_uuid: p.clientUuid,
            status: p.status,
            thumbnail_url: thumb?.url ?? null,
            thumbnail_url_expires_in: thumb?.expires_in ?? null,
            url: full?.url ?? null,
            url_expires_in: full?.expires_in ?? null,
          };
        }),
      ),
    };
  }
}

type CreateInput = {
  client_uuid: string;
  project_id: string;
  category: 'defect' | 'normal' | 'note';
  note?: string | null;
  latitude: number;
  longitude: number;
  accuracy_m?: number | null;
  altitude_m?: number | null;
  heading_deg?: number | null;
  location_source?: string;
  location_adjusted?: boolean;
  captured_at: string;
  client_device_info?: Record<string, unknown>;
};

function clampLimit(raw?: string): number {
  const n = raw ? Number(raw) : 50;
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(200, Math.floor(n));
}

function firstId(result: unknown): string | null {
  const rows = (result as { rows?: Array<{ id: string }> }).rows ?? (result as Array<{ id: string }>);
  if (Array.isArray(rows) && rows[0]?.id) return rows[0].id;
  return null;
}
