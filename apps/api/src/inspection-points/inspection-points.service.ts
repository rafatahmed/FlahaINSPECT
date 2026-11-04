import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, photos, projectMembers, projects, releasedFindings } from '../db/schema';
import { projectAccess } from '../projects/project-access';
import { StorageService } from '../storage/storage.service';
import { recordSyncLag } from '../metrics/registry';
import { allowlistDeviceInfo, fieldPayloadEqual } from './field-payload';

type QueryDatabase = Pick<Db, 'select' | 'execute'>;

@Injectable()
export class InspectionPointsService {
  constructor(
    @Inject('DB') private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  async create(actor: AuthUser, input: CreateInput) {
    try {
      return await this.db.transaction(tx => this.createPoint(actor, input, tx));
    } catch (error) {
      const pg = error as { code?: string; cause?: { code?: string } };
      if (pg.code === '23505' || pg.cause?.code === '23505') {
        throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
      }
      throw error;
    }
  }

  private async createPoint(actor: AuthUser, input: CreateInput, db: QueryDatabase) {
    const project = await this.loadProject(input.project_id, db);
    const memberships = await this.memberIds(actor.id, db);
    const access = projectAccess(actor, project, memberships.has(input.project_id));
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
    if (project.isArchived) throw new ApiException(ErrorCode.PROJECT_ARCHIVED);

    const sessionFields = [input.session_client_uuid, input.session_device_id, input.session_started_at, input.observation_number];
    if (sessionFields.some(v => v !== undefined)) {
      if (sessionFields.some(v => v == null) || !Number.isInteger(input.observation_number) ||
          input.observation_number! < 1 || input.observation_number! > 2147483647) {
        throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'Session identity and number must be supplied together.');
      }
      await db.execute(sql`INSERT INTO inspection_sessions(id,project_id,inspector_id,device_id,started_at)
        VALUES (${input.session_client_uuid}::uuid,${input.project_id}::uuid,${actor.id}::uuid,
          ${input.session_device_id}::uuid,${input.session_started_at}::timestamptz)
        ON CONFLICT(id) DO NOTHING`);
      const session = await db.execute<{project_id:string; inspector_id:string; device_id:string; started_at:Date; ended_at:Date|null; closure:unknown; manifest:Array<{client_uuid:string;observation_number:number;disposition:string}>|null}>(sql`
        SELECT project_id,inspector_id,device_id,started_at,ended_at,manifest,closure FROM inspection_sessions
        WHERE id=${input.session_client_uuid}::uuid FOR UPDATE`);
      const row = session.rows[0];
      if (!row || row.project_id !== input.project_id || row.inspector_id !== actor.id ||
          row.device_id !== input.session_device_id ||
          new Date(row.started_at).getTime() !== new Date(input.session_started_at!).getTime()) {
        throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
      }
      if(row.closure && !row.ended_at) throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY,undefined,'Closed visit requires original-phone inventory reconciliation.');
      if(row.ended_at && !row.manifest?.some(e=>e.client_uuid===input.client_uuid && e.observation_number===input.observation_number && e.disposition==='saved')) {
        throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY,undefined,'This session has ended; only inventoried saved evidence can sync.');
      }
    }

    const capturedAt = new Date(input.captured_at);
    const note = input.note ?? null;
    const locationSource = input.location_source ?? 'phone_gps';
    const locationAdjusted = input.location_adjusted ?? false;
    const device = allowlistDeviceInfo(input.client_device_info);

    const inserted = await db.execute<{ id: string }>(sql`
      INSERT INTO inspection_points (
        client_uuid, project_id, inspector_id, session_id, observation_number, category, note,
        location, latitude, longitude, accuracy_m, altitude_m, heading_deg,
        location_source, location_adjusted, captured_at, client_device_info, outside_boundary
      ) VALUES (
        ${input.client_uuid}::uuid,
        ${input.project_id}::uuid,
        ${actor.id}::uuid,
        ${input.session_client_uuid ?? null}::uuid,
        ${input.observation_number ?? null},
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
      return { status: 201 as const, point: await this.loadPublic(newId, db) };
    }

    const existing = await db
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
    if (!same || row.sessionId !== (input.session_client_uuid ?? null) ||
        row.observationNumber !== (input.observation_number ?? null)) {
      throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
    }
    return { status: 200 as const, point: await this.loadPublic(row.id, db) };
  }

  async get(actor: AuthUser, id: string) {
    const row = await this.requirePoint(actor, id);
    const point = await this.loadPublic(row.id);
    if (actor.role !== 'manager') return { point };
    const [release] = await this.db.select({ summary: releasedFindings.summary })
      .from(releasedFindings).where(eq(releasedFindings.pointId, row.id));
    return { point: { ...point, release: release ?? null } };
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
      cursor?: string;
    },
  ) {
    await this.assertProjectAccess(actor, query.project_id);
    const limit = clampLimit(query.limit);
    const filters = [
      eq(inspectionPoints.projectId, query.project_id),
      isNull(inspectionPoints.deletedAt),
    ];
    if (query.cursor !== undefined) {
      if (typeof query.cursor !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(query.cursor)) {
        throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'Invalid observation cursor');
      }
      filters.push(sql`(${inspectionPoints.capturedAt}, ${inspectionPoints.id}) < (
        SELECT captured_at, id FROM inspection_points
        WHERE id = ${query.cursor}::uuid AND project_id = ${query.project_id}::uuid
      )`);
    }
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
      .orderBy(desc(inspectionPoints.capturedAt), desc(inspectionPoints.id))
      .limit(limit + 1);
    const page = rows.slice(0, limit);
    const releases = actor.role === 'manager' && page.length
      ? await this.db.select({ pointId: releasedFindings.pointId, summary: releasedFindings.summary })
        .from(releasedFindings).where(inArray(releasedFindings.pointId, page.map(row => row.id)))
      : [];
    const byPoint = new Map(releases.map(row => [row.pointId, { summary: row.summary }]));
    const items = [];
    for (const row of page) {
      const point = await this.loadPublic(row.id);
      items.push(actor.role === 'manager' ? { ...point, release: byPoint.get(row.id) ?? null } : point);
    }
    return { items, next_cursor: rows.length > limit ? rows[limit - 1].id : null };
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
    const updated = await this.db
      .update(inspectionPoints)
      .set({
        ...(input.remarks !== undefined ? { remarks: input.remarks } : {}),
        ...(input.recommended_procedure !== undefined
          ? { recommendedProcedure: input.recommended_procedure }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        version: row.version + 1,
      })
      .where(and(eq(inspectionPoints.id, id), eq(inspectionPoints.version, input.version)))
      .returning({ id: inspectionPoints.id });
    if (!updated.length) {
      const current = await this.requirePoint(actor, id);
      throw new ApiException(ErrorCode.CONFLICT_VERSION, { current_version: current.version });
    }
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

  private async loadProject(id: string, db: QueryDatabase = this.db) {
    const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ?? null;
  }

  private async memberIds(userId: string, db: QueryDatabase = this.db): Promise<Set<string>> {
    const rows = await db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));
    return new Set(rows.map((r) => r.projectId));
  }

  private async loadPublic(id: string, db: QueryDatabase = this.db) {
    const [row] = await db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.id, id));
    const photoRows = await db
      .select()
      .from(photos)
      .where(eq(photos.inspectionPointId, id));
    return {
      id: row.id,
      client_uuid: row.clientUuid,
      session_client_uuid: row.sessionId,
      observation_number: row.observationNumber,
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
  session_client_uuid?: string;
  session_device_id?: string;
  session_started_at?: string;
  observation_number?: number;
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
