-- FlahaINSPECT MVP schema (KD-16 raw SQL + PostGIS).
-- Written expand-safe: re-running the statements is a no-op on an applied DB.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('inspector', 'manager', 'client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE point_category AS ENUM ('defect', 'normal', 'note');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE point_status AS ENUM (
    'open',
    'in_progress',
    'resolved',
    'closed',
    'acknowledged'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('queued', 'processing', 'ready', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE photo_status AS ENUM (
    'pending_upload',
    'uploading',
    'processing',
    'ready',
    'failed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM (
    'generate_report',
    'generate_thumbnail',
    'gc_orphan_object'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM (
    'pending',
    'running',
    'succeeded',
    'failed',
    'dead'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL,
  password_hash   TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'inspector',
  locale          TEXT NOT NULL DEFAULT 'en',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  token_version   INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_lower_chk CHECK (email = lower(email)),
  CONSTRAINT users_email_len_chk CHECK (char_length(email) <= 254),
  CONSTRAINT users_full_name_len_chk CHECK (char_length(full_name) <= 200 AND char_length(full_name) >= 1),
  CONSTRAINT users_email_uq UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  code            TEXT,
  description     TEXT,
  boundary        geometry(Polygon, 4326),
  bbox            geometry(Polygon, 4326),
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT projects_name_len_chk CHECK (char_length(name) <= 200 AND char_length(name) >= 1),
  CONSTRAINT projects_code_len_chk CHECK (code IS NULL OR char_length(code) <= 200)
);

CREATE UNIQUE INDEX IF NOT EXISTS projects_code_uq ON projects (code) WHERE code IS NOT NULL;
CREATE INDEX IF NOT EXISTS projects_boundary_gix ON projects USING GIST (boundary);
CREATE INDEX IF NOT EXISTS projects_updated_at_id_idx ON projects (updated_at, id);

CREATE TABLE IF NOT EXISTS project_members (
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Schema-ready for future per-project roles. MVP MUST NOT read this for AuthZ (KD-33).
  member_role     user_role NOT NULL DEFAULT 'inspector',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS project_members_user_idx ON project_members (user_id);

CREATE TABLE IF NOT EXISTS inspection_points (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid             UUID NOT NULL,
  project_id              UUID NOT NULL REFERENCES projects(id),
  inspector_id            UUID NOT NULL REFERENCES users(id),
  category                point_category NOT NULL,
  note                    TEXT,
  remarks                 TEXT,
  recommended_procedure   TEXT,
  status                  point_status NOT NULL DEFAULT 'open',
  location                geography(Point, 4326) NOT NULL,
  latitude                DOUBLE PRECISION NOT NULL,
  longitude               DOUBLE PRECISION NOT NULL,
  accuracy_m              REAL,
  altitude_m              REAL,
  heading_deg             REAL,
  location_source         TEXT NOT NULL DEFAULT 'phone_gps',
  location_adjusted       BOOLEAN NOT NULL DEFAULT FALSE,
  outside_boundary        BOOLEAN NOT NULL DEFAULT FALSE,
  captured_at             TIMESTAMPTZ NOT NULL,
  client_device_info      JSONB,
  version                 INT NOT NULL DEFAULT 1,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ,
  CONSTRAINT inspection_points_client_uuid_uq UNIQUE (client_uuid),
  CONSTRAINT inspection_points_note_len_chk CHECK (note IS NULL OR char_length(note) <= 4000),
  CONSTRAINT inspection_points_remarks_len_chk CHECK (remarks IS NULL OR char_length(remarks) <= 4000),
  CONSTRAINT inspection_points_procedure_len_chk CHECK (
    recommended_procedure IS NULL OR char_length(recommended_procedure) <= 4000
  )
);

CREATE INDEX IF NOT EXISTS inspection_points_project_idx
  ON inspection_points (project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS inspection_points_project_cat_idx
  ON inspection_points (project_id, category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS inspection_points_project_status_idx
  ON inspection_points (project_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS inspection_points_captured_at_idx
  ON inspection_points (project_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS inspection_points_location_gix
  ON inspection_points USING GIST (location);
CREATE INDEX IF NOT EXISTS inspection_points_updated_at_id_idx
  ON inspection_points (updated_at, id);

CREATE TABLE IF NOT EXISTS photos (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid         UUID NOT NULL UNIQUE,
  inspection_point_id UUID NOT NULL REFERENCES inspection_points(id) ON DELETE CASCADE,
  project_id          UUID NOT NULL REFERENCES projects(id),
  sha256              CHAR(64) NOT NULL,
  byte_size           BIGINT NOT NULL,
  content_type        TEXT NOT NULL DEFAULT 'image/jpeg',
  width_px            INT,
  height_px           INT,
  storage_key         TEXT,
  thumbnail_key       TEXT,
  original_filename   TEXT,
  status              photo_status NOT NULL DEFAULT 'pending_upload',
  tus_upload_id       TEXT,
  exif_json           JSONB,
  uploaded_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT photos_one_per_point_uq UNIQUE (inspection_point_id),
  CONSTRAINT photos_filename_len_chk CHECK (
    original_filename IS NULL OR char_length(original_filename) <= 255
  )
);

CREATE INDEX IF NOT EXISTS photos_project_idx ON photos (project_id);
CREATE INDEX IF NOT EXISTS photos_status_idx ON photos (status);
CREATE INDEX IF NOT EXISTS photos_updated_at_id_idx ON photos (updated_at, id);

CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id),
  requested_by    UUID NOT NULL REFERENCES users(id),
  status          report_status NOT NULL DEFAULT 'queued',
  title           TEXT,
  filters_json    JSONB,
  storage_key     TEXT,
  error_message   TEXT,
  point_count     INT,
  generated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reports_project_idx ON reports (project_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS reports_one_active_per_project
  ON reports (project_id)
  WHERE status IN ('queued', 'processing');

CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            job_type NOT NULL,
  status          job_status NOT NULL DEFAULT 'pending',
  payload         JSONB NOT NULL,
  attempts        INT NOT NULL DEFAULT 0,
  max_attempts    INT NOT NULL DEFAULT 5,
  run_after       TIMESTAMPTZ NOT NULL DEFAULT now(),
  locked_at       TIMESTAMPTZ,
  locked_by       TEXT,
  last_error      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_poll_idx ON jobs (status, run_after)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      TEXT NOT NULL UNIQUE,
  family_id       UUID NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  replaced_by     UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS refresh_tokens_family_idx ON refresh_tokens (family_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id              BIGSERIAL PRIMARY KEY,
  actor_id        UUID REFERENCES users(id),
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID,
  payload         JSONB,
  ip              TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs (action, created_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION projects_set_bbox()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.boundary IS NOT NULL THEN
    NEW.bbox := ST_Envelope(NEW.boundary)::geometry(Polygon, 4326);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER projects_set_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER inspection_points_set_updated_at BEFORE UPDATE ON inspection_points
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER photos_set_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER reports_set_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER jobs_set_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER projects_set_bbox BEFORE INSERT OR UPDATE OF boundary ON projects
    FOR EACH ROW EXECUTE FUNCTION projects_set_bbox();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
