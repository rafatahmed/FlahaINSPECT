CREATE TABLE released_findings (
  point_id uuid PRIMARY KEY REFERENCES inspection_points(id),
  project_id uuid NOT NULL REFERENCES projects(id),
  source_version integer NOT NULL,
  summary text NOT NULL CHECK (char_length(trim(summary)) BETWEEN 1 AND 4000),
  category point_category NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  photo_key text NOT NULL,
  released_by uuid NOT NULL REFERENCES users(id),
  released_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX released_findings_project_idx ON released_findings(project_id, released_at DESC);
