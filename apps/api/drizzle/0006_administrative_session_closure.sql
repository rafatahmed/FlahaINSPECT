ALTER TABLE inspection_sessions ADD COLUMN closure jsonb;
--> statement-breakpoint
CREATE FUNCTION preserve_session_closure() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.closure IS NOT NULL AND NEW.closure IS DISTINCT FROM OLD.closure THEN
  RAISE EXCEPTION 'Administrative closure history is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER immutable_session_closure BEFORE UPDATE ON inspection_sessions FOR EACH ROW EXECUTE FUNCTION preserve_session_closure();
--> statement-breakpoint
CREATE OR REPLACE FUNCTION enforce_session_photo_inventory() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE visit inspection_sessions%ROWTYPE; point_uuid uuid;
BEGIN
 SELECT s.* INTO visit FROM inspection_sessions s JOIN inspection_points p ON p.session_id=s.id WHERE p.id=NEW.inspection_point_id FOR UPDATE OF s;
 IF visit.closure IS NOT NULL AND visit.ended_at IS NULL THEN
  RAISE EXCEPTION 'Closed visit requires original-phone reconciliation' USING ERRCODE='23514';
 END IF;
 IF visit.ended_at IS NOT NULL THEN
  SELECT client_uuid INTO point_uuid FROM inspection_points WHERE id=NEW.inspection_point_id;
  IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(visit.manifest) e WHERE e->>'client_uuid'=point_uuid::text AND e->>'photo_client_uuid'=NEW.client_uuid::text AND e->>'disposition'='saved') THEN
   RAISE EXCEPTION 'Photo is not in the final session inventory' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
