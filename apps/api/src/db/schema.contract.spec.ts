import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const sql = readFileSync(join(__dirname, '../../drizzle/0001_init.sql'), 'utf8');

describe('0001_init.sql (KD-16 / PR-03 contract)', () => {
  it('enables PostGIS and pgcrypto', () => {
    expect(sql).toMatch(/CREATE EXTENSION IF NOT EXISTS postgis/);
    expect(sql).toMatch(/CREATE EXTENSION IF NOT EXISTS pgcrypto/);
  });

  it('keeps member_role on project_members (unused for AuthZ, KD-33)', () => {
    expect(sql).toMatch(/member_role\s+user_role NOT NULL DEFAULT 'inspector'/);
    expect(sql).toMatch(/MUST NOT read this for AuthZ/);
  });

  it('enforces one active report per project', () => {
    expect(sql).toMatch(/CREATE UNIQUE INDEX IF NOT EXISTS reports_one_active_per_project/);
    expect(sql).toMatch(/WHERE status IN \('queued', 'processing'\)/);
  });

  it('enforces one photo per point', () => {
    expect(sql).toMatch(/CONSTRAINT photos_one_per_point_uq UNIQUE \(inspection_point_id\)/);
  });

  it('applies KD-40 length checks', () => {
    expect(sql).toMatch(/users_email_len_chk/);
    expect(sql).toMatch(/inspection_points_note_len_chk/);
    expect(sql).toMatch(/char_length\(note\) <= 4000/);
  });

  it('installs updated_at and bbox triggers', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION set_updated_at/);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION projects_set_bbox/);
    expect(sql).toMatch(/EXECUTE FUNCTION projects_set_bbox/);
  });
});
