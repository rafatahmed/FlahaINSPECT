CREATE TABLE session_inventory_parts (
 session_id uuid NOT NULL REFERENCES inspection_sessions(id),
 offset_index integer NOT NULL CHECK (offset_index >= 0 AND offset_index % 1000 = 0),
 ended_at timestamptz NOT NULL,
 allocated_count integer NOT NULL CHECK (allocated_count >= 0),
 inventory_size integer NOT NULL CHECK (inventory_size > 10000 AND inventory_size <= allocated_count),
 observations jsonb NOT NULL CHECK (jsonb_typeof(observations) = 'array' AND jsonb_array_length(observations) BETWEEN 1 AND 1000),
 PRIMARY KEY(session_id, offset_index)
);
