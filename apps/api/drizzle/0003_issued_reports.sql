ALTER TABLE reports ADD COLUMN client_revision integer, ADD COLUMN request_id uuid;
CREATE UNIQUE INDEX reports_client_revision ON reports(project_id,client_revision);
CREATE UNIQUE INDEX reports_request_id ON reports(request_id);
