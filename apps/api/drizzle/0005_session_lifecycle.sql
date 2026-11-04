ALTER TABLE inspection_sessions
 ADD COLUMN ended_at timestamptz,
 ADD COLUMN manifest jsonb,
 ADD COLUMN allocated_count integer CHECK(allocated_count>=0),
 ADD COLUMN sequence integer NOT NULL DEFAULT 0 CHECK(sequence>=0),
 ADD COLUMN known_pending integer CHECK(known_pending>=0),
 ADD COLUMN known_failed integer CHECK(known_failed>=0),
 ADD COLUMN complete_requested boolean NOT NULL DEFAULT false,
 ADD COLUMN last_contact_at timestamptz;
--> statement-breakpoint
CREATE FUNCTION enforce_session_photo_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE visit inspection_sessions%ROWTYPE; point_uuid uuid;
BEGIN
 SELECT s.* INTO visit FROM inspection_sessions s JOIN inspection_points p ON p.session_id=s.id WHERE p.id=NEW.inspection_point_id FOR UPDATE OF s;
 IF visit.ended_at IS NOT NULL THEN
  SELECT client_uuid INTO point_uuid FROM inspection_points WHERE id=NEW.inspection_point_id;
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(visit.manifest) e WHERE e->>'client_uuid'=point_uuid::text AND e->>'photo_client_uuid'=NEW.client_uuid::text AND e->>'disposition'='saved') THEN
   RAISE EXCEPTION 'Photo is not in the final session inventory' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER session_photo_inventory BEFORE INSERT ON photos FOR EACH ROW EXECUTE FUNCTION enforce_session_photo_inventory();
