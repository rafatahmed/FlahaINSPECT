import {
  bigint,
  bigserial,
  boolean,
  char,
  customType,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/** PostGIS geography(Point, 4326). Raw SQL owns the type; Drizzle treats it as opaque text. */
const geographyPoint = customType<{ data: string }>({
  dataType() {
    return 'geography(Point, 4326)';
  },
});

const geometryPolygon = customType<{ data: string }>({
  dataType() {
    return 'geometry(Polygon, 4326)';
  },
});

export const userRole = pgEnum('user_role', ['inspector', 'manager', 'client']);
export const pointCategory = pgEnum('point_category', ['defect', 'normal', 'note']);
export const pointStatus = pgEnum('point_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
  'acknowledged',
]);
export const reportStatus = pgEnum('report_status', [
  'queued',
  'processing',
  'ready',
  'failed',
]);
export const photoStatus = pgEnum('photo_status', [
  'pending_upload',
  'uploading',
  'processing',
  'ready',
  'failed',
]);
export const jobType = pgEnum('job_type', [
  'generate_report',
  'generate_thumbnail',
  'gc_orphan_object',
]);
export const jobStatus = pgEnum('job_status', [
  'pending',
  'running',
  'succeeded',
  'failed',
  'dead',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: userRole('role').notNull().default('inspector'),
  locale: text('locale').notNull().default('en'),
  isActive: boolean('is_active').notNull().default(true),
  tokenVersion: integer('token_version').notNull().default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    code: text('code'),
    description: text('description'),
    boundary: geometryPolygon('boundary'),
    bbox: geometryPolygon('bbox'),
    isArchived: boolean('is_archived').notNull().default(false),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('projects_code_uq').on(t.code),
    index('projects_updated_at_id_idx').on(t.updatedAt, t.id),
  ],
);

export const projectMembers = pgTable(
  'project_members',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Unused for AuthZ in MVP (KD-33). Assignment only.
    memberRole: userRole('member_role').notNull().default('inspector'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.userId] }),
    index('project_members_user_idx').on(t.userId),
  ],
);

export const inspectionPoints = pgTable(
  'inspection_points',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientUuid: uuid('client_uuid').notNull().unique(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    inspectorId: uuid('inspector_id')
      .notNull()
      .references(() => users.id),
    category: pointCategory('category').notNull(),
    note: text('note'),
    remarks: text('remarks'),
    recommendedProcedure: text('recommended_procedure'),
    status: pointStatus('status').notNull().default('open'),
    location: geographyPoint('location').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    accuracyM: real('accuracy_m'),
    altitudeM: real('altitude_m'),
    headingDeg: real('heading_deg'),
    locationSource: text('location_source').notNull().default('phone_gps'),
    locationAdjusted: boolean('location_adjusted').notNull().default(false),
    outsideBoundary: boolean('outside_boundary').notNull().default(false),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull(),
    clientDeviceInfo: jsonb('client_device_info'),
    version: integer('version').notNull().default(1),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    index('inspection_points_updated_at_id_idx').on(t.updatedAt, t.id),
  ],
);

export const photos = pgTable(
  'photos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    clientUuid: uuid('client_uuid').notNull().unique(),
    inspectionPointId: uuid('inspection_point_id')
      .notNull()
      .references(() => inspectionPoints.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    sha256: char('sha256', { length: 64 }).notNull(),
    byteSize: bigint('byte_size', { mode: 'number' }).notNull(),
    contentType: text('content_type').notNull().default('image/jpeg'),
    widthPx: integer('width_px'),
    heightPx: integer('height_px'),
    storageKey: text('storage_key'),
    thumbnailKey: text('thumbnail_key'),
    originalFilename: text('original_filename'),
    status: photoStatus('status').notNull().default('pending_upload'),
    tusUploadId: text('tus_upload_id'),
    exifJson: jsonb('exif_json'),
    uploadedAt: timestamp('uploaded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('photos_one_per_point_uq').on(t.inspectionPointId),
    index('photos_project_idx').on(t.projectId),
    index('photos_status_idx').on(t.status),
  ],
);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id),
    requestedBy: uuid('requested_by')
      .notNull()
      .references(() => users.id),
    status: reportStatus('status').notNull().default('queued'),
    title: text('title'),
    filtersJson: jsonb('filters_json'),
    storageKey: text('storage_key'),
    errorMessage: text('error_message'),
    pointCount: integer('point_count'),
    generatedAt: timestamp('generated_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('reports_one_active_per_project')
      .on(t.projectId)
      .where(sql`status IN ('queued', 'processing')`),
  ],
);

export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: jobType('type').notNull(),
    status: jobStatus('status').notNull().default('pending'),
    payload: jsonb('payload').notNull(),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(5),
    runAfter: timestamp('run_after', { withTimezone: true }).notNull().defaultNow(),
    lockedAt: timestamp('locked_at', { withTimezone: true }),
    lockedBy: text('locked_by'),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('jobs_poll_idx').on(t.status, t.runAfter),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    familyId: uuid('family_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedBy: uuid('replaced_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('refresh_tokens_user_idx').on(t.userId),
    index('refresh_tokens_family_idx').on(t.familyId),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    actorId: uuid('actor_id').references(() => users.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    payload: jsonb('payload'),
    ip: text('ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_logs_entity_idx').on(t.entityType, t.entityId),
  ],
);
