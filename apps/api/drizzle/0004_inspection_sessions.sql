CREATE TABLE inspection_sessions (
 id uuid PRIMARY KEY,
 project_id uuid NOT NULL REFERENCES projects(id),
 inspector_id uuid NOT NULL REFERENCES users(id),
 device_id uuid NOT NULL,
 started_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE inspection_points ADD COLUMN session_id uuid REFERENCES inspection_sessions(id),
 ADD COLUMN observation_number integer,
 ADD CONSTRAINT inspection_points_session_number_pair CHECK (
 (session_id IS NULL AND observation_number IS NULL) OR
 (session_id IS NOT NULL AND observation_number IS NOT NULL AND observation_number > 0));
--> statement-breakpoint
CREATE UNIQUE INDEX inspection_points_session_number_uq ON inspection_points(session_id, observation_number);
