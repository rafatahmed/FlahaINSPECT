import { Inject, Injectable } from '@nestjs/common';
import { and, eq, ne, sql } from 'drizzle-orm';
import type { AuthUser } from '../auth/auth.types';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';
import type { Db } from '../db/client';
import { inspectionPoints, jobs, photos, projectMembers, projects } from '../db/schema';
import { projectAccess } from '../projects/project-access';
import { StorageService } from '../storage/storage.service';
import {
  canonicalPhotoKey,
  decidePhotoRegister,
  type PhotoStatus,
} from './photo-register-state';
import { extractBearer, signUploadToken, verifyUploadToken } from './upload-token';
import { LoginLimiter } from '../auth/login-limiter';

const MAX_UPLOAD = 25 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

@Injectable()
export class PhotosService {
  private readonly registerLimit = new LoginLimiter(60, 60_000, 10_000, 60_000);

  constructor(
    @Inject('DB') private readonly db: Db,
    private readonly storage: StorageService,
  ) {}

  async register(actor: AuthUser, input: RegisterInput, _ip: string) {
    this.registerLimit.assertCanAttempt(actor.id, actor.id);
    this.registerLimit.recordAttempt(actor.id);

    const point = await this.db
      .select()
      .from(inspectionPoints)
      .where(eq(inspectionPoints.clientUuid, input.inspection_point_client_uuid))
      .limit(1);
    if (!point[0] || point[0].deletedAt) {
      throw new ApiException(ErrorCode.PHOTO_PARENT_MISSING);
    }
    if (point[0].projectId !== input.project_id) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'project_id does not match point');
    }
    await this.assertProjectAccess(actor, input.project_id);
    const project = await this.loadProject(input.project_id);
    if (project?.isArchived) {
      throw new ApiException(ErrorCode.PROJECT_ARCHIVED);
    }

    const existingByClient = await this.db
      .select()
      .from(photos)
      .where(eq(photos.clientUuid, input.client_uuid))
      .limit(1);
    const otherOnPoint = await this.db
      .select({ id: photos.id })
      .from(photos)
      .where(
        and(
          eq(photos.inspectionPointId, point[0].id),
          ne(photos.clientUuid, input.client_uuid),
        ),
      )
      .limit(1);

    const decision = decidePhotoRegister({
      existing: existingByClient[0]
        ? {
            inspectionPointId: existingByClient[0].inspectionPointId,
            status: existingByClient[0].status as PhotoStatus,
            sha256: existingByClient[0].sha256,
            byteSize: existingByClient[0].byteSize,
          }
        : null,
      request: {
        inspectionPointId: point[0].id,
        sha256: input.sha256,
        byteSize: input.byte_size,
      },
      pointHasOtherPhoto: otherOnPoint.length > 0,
    });

    if (decision.kind === 'conflict-point') {
      throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
    }
    if (decision.kind === 'photo-exists') {
      throw new ApiException(ErrorCode.PHOTO_ALREADY_EXISTS);
    }

    if (decision.kind === 'insert') {
      const [created] = await this.db
        .insert(photos)
        .values({
          clientUuid: input.client_uuid,
          inspectionPointId: point[0].id,
          projectId: input.project_id,
          sha256: input.sha256.toLowerCase(),
          byteSize: input.byte_size,
          contentType: input.content_type ?? 'image/jpeg',
          widthPx: input.width_px,
          heightPx: input.height_px,
          originalFilename: input.original_filename,
          status: 'pending_upload',
        })
        .returning();
      return this.registerResponse(created, 201, true, false);
    }

    const row = existingByClient[0];
    if (decision.kind === 'noop') {
      return this.registerResponse(row, 200, false, decision.includeUrls);
    }

    const patch: Record<string, unknown> = { status: 'pending_upload' };
    if (decision.kind === 'reissue-clear-tus') {
      patch.tusUploadId = null;
      patch.storageKey = null;
      if (decision.refreshMeta) {
        patch.sha256 = input.sha256.toLowerCase();
        patch.byteSize = input.byte_size;
        patch.widthPx = input.width_px;
        patch.heightPx = input.height_px;
        patch.contentType = input.content_type ?? row.contentType;
      }
    }
    const [updated] = await this.db
      .update(photos)
      .set(patch)
      .where(eq(photos.id, row.id))
      .returning();
    return this.registerResponse(updated, 200, true, false);
  }

  async get(actor: AuthUser, id: string, ip: string) {
    const row = await this.byId(id);
    if (!row) throw new ApiException(ErrorCode.NOT_FOUND);
    await this.assertProjectAccess(actor, row.projectId);
    await this.db.execute(sql`
      INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, ip)
      VALUES (${actor.id}::uuid, 'photo.url_issue', 'photo', ${row.id}::uuid, ${ip})
    `);
    return this.publicPhoto(row, true);
  }

  async preCreate(headers: Record<string, string | undefined>, body: TusHookBody) {
    const token = extractBearer(headers.authorization) ?? body.Upload?.MetaData?.authorization;
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!token || !secret) {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    let claims;
    try {
      claims = verifyUploadToken(token, secret);
    } catch {
      throw new ApiException(ErrorCode.UNAUTHORIZED);
    }
    const length = body.Upload?.Size ?? Number(headers['upload-length']);
    if (!Number.isFinite(length) || length > MAX_UPLOAD) {
      throw new ApiException(ErrorCode.PAYLOAD_TOO_LARGE);
    }
    if (length !== claims.byte_size) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'upload length does not match register');
    }
    const ctype = (
      body.Upload?.MetaData?.filetype ??
      body.Upload?.MetaData?.contentType ??
      'image/jpeg'
    ).toLowerCase();
    if (!ALLOWED_TYPES.has(ctype)) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'content-type not allowed');
    }
    const row = await this.byClient(claims.photo_client_uuid);
    if (!row || row.id !== claims.photo_id) {
      throw new ApiException(ErrorCode.PHOTO_NOT_REGISTERED);
    }
    if (row.status === 'ready' || row.status === 'processing') {
      throw new ApiException(ErrorCode.CONFLICT_IDEMPOTENCY);
    }
    if (row.byteSize !== claims.byte_size) {
      throw new ApiException(ErrorCode.VALIDATION_ERROR);
    }
    const tusId = body.Upload?.ID;
    if (tusId && !row.tusUploadId) {
      await this.db.update(photos).set({ tusUploadId: tusId, status: 'uploading' }).where(eq(photos.id, row.id));
    } else if (row.status === 'pending_upload') {
      await this.db.update(photos).set({ status: 'uploading' }).where(eq(photos.id, row.id));
    }
    return { ok: true };
  }

  async postFinish(body: TusHookBody) {
    const meta = body.Upload?.MetaData ?? {};
    const clientUuid = meta.photo_client_uuid ?? meta.inspection_id;
    const tusId = body.Upload?.ID;
    const row = clientUuid
      ? await this.byClient(clientUuid)
      : tusId
        ? (await this.db.select().from(photos).where(eq(photos.tusUploadId, tusId)).limit(1))[0]
        : null;
    if (!row) {
      throw new ApiException(ErrorCode.PHOTO_NOT_REGISTERED);
    }
    if (row.status === 'ready') {
      return { ok: true, idempotent: true };
    }

    const tusKey =
      body.Upload?.Storage?.Key ??
      (tusId ? `uploads/${tusId}` : null);
    const size = (tusKey ? await this.storage.headSize(tusKey) : null) ?? body.Upload?.Size;
    if (size != null && size !== row.byteSize) {
      await this.failPhoto(row.id, row.inspectionPointId);
      throw new ApiException(ErrorCode.HASH_MISMATCH);
    }

    const dest = canonicalPhotoKey(row.projectId, row.inspectionPointId, row.id);
    let storageKey = tusKey;
    if (tusKey && tusKey !== dest) {
      const copied = await this.storage.copyObject(tusKey, dest);
      if (copied) storageKey = dest;
    }

    const alreadyProcessing = row.status === 'processing';
    await this.db
      .update(photos)
      .set({
        status: 'processing',
        storageKey,
        tusUploadId: tusId ?? row.tusUploadId,
        uploadedAt: new Date(),
      })
      .where(eq(photos.id, row.id));

    if (!alreadyProcessing) {
      await this.bumpPoint(row.inspectionPointId);
      await this.db.insert(jobs).values({
        type: 'generate_thumbnail',
        payload: { photo_id: row.id },
      });
    }
    return { ok: true };
  }

  private async failPhoto(photoId: string, pointId: string) {
    await this.db.update(photos).set({ status: 'failed' }).where(eq(photos.id, photoId));
    await this.bumpPoint(pointId);
  }

  private async bumpPoint(pointId: string) {
    await this.db
      .update(inspectionPoints)
      .set({ updatedAt: new Date() })
      .where(eq(inspectionPoints.id, pointId));
  }

  private async registerResponse(
    row: typeof photos.$inferSelect,
    status: 200 | 201,
    mintToken: boolean,
    includeUrls: boolean,
  ) {
    const secret = process.env.JWT_ACCESS_SECRET ?? 'dev-upload';
    const upload_token = mintToken
      ? signUploadToken(
          {
            photo_id: row.id,
            photo_client_uuid: row.clientUuid,
            project_id: row.projectId,
            byte_size: row.byteSize,
          },
          secret,
        )
      : null;
    const publicPhoto = await this.publicPhoto(row, includeUrls);
    return {
      status,
      photo: {
        ...publicPhoto,
        upload_token,
        upload_url: mintToken ? (process.env.TUSD_PUBLIC_URL ?? 'http://localhost:1080/files/') : null,
        max_size: MAX_UPLOAD,
        tus_upload_id: row.tusUploadId,
      },
    };
  }

  async publicPhoto(row: typeof photos.$inferSelect, includeUrls: boolean) {
    const full = includeUrls ? await this.storage.signedGet(row.storageKey) : null;
    const thumb = includeUrls ? await this.storage.signedGet(row.thumbnailKey) : null;
    return {
      id: row.id,
      client_uuid: row.clientUuid,
      inspection_point_id: row.inspectionPointId,
      project_id: row.projectId,
      status: row.status,
      sha256: row.sha256,
      byte_size: row.byteSize,
      content_type: row.contentType,
      url: full?.url ?? null,
      url_expires_in: full?.expires_in ?? null,
      thumbnail_url: thumb?.url ?? null,
      thumbnail_url_expires_in: thumb?.expires_in ?? null,
    };
  }

  private async byId(id: string) {
    const rows = await this.db.select().from(photos).where(eq(photos.id, id)).limit(1);
    return rows[0] ?? null;
  }

  private async byClient(clientUuid: string) {
    const rows = await this.db
      .select()
      .from(photos)
      .where(eq(photos.clientUuid, clientUuid))
      .limit(1);
    return rows[0] ?? null;
  }

  private async assertProjectAccess(actor: AuthUser, projectId: string) {
    const rows = await this.db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    const memberships = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, actor.id));
    const access = projectAccess(
      actor,
      rows[0] ?? null,
      memberships.some((m) => m.projectId === projectId),
    );
    if (access === 'not_found') throw new ApiException(ErrorCode.NOT_FOUND);
    if (access === 'forbidden') throw new ApiException(ErrorCode.FORBIDDEN);
  }

  private async loadProject(id: string) {
    const rows = await this.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    return rows[0] ?? null;
  }
}

export type RegisterInput = {
  client_uuid: string;
  inspection_point_client_uuid: string;
  project_id: string;
  sha256: string;
  byte_size: number;
  content_type?: string;
  width_px?: number;
  height_px?: number;
  original_filename?: string;
};

export type TusHookBody = {
  Type?: string;
  Upload?: {
    ID?: string;
    Size?: number;
    MetaData?: Record<string, string>;
    Storage?: { Key?: string };
  };
};
