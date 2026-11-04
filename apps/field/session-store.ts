type Value = string | number | null;
export type SessionDatabase = {
  execSync(sql: string): void;
  getFirstSync<T>(sql: string, ...args: Value[]): T | null;
  runSync(sql: string, ...args: Value[]): unknown;
};
export type InspectionSession = {
  id: string; owner: string; project_id: string; device_id: string; started_at: string; next_number: number;
};
type Capture = { client_uuid: string; project_id: string; [key: string]: unknown };

// Additive tables: existing observation JSON, files and TUS resources remain untouched.
export function createSessionStore(db: SessionDatabase) {
  db.execSync('CREATE TABLE IF NOT EXISTS inspection_session (id TEXT PRIMARY KEY, owner TEXT NOT NULL, project_id TEXT NOT NULL, device_id TEXT NOT NULL, started_at TEXT NOT NULL, next_number INTEGER NOT NULL DEFAULT 1); CREATE TABLE IF NOT EXISTS capture_device (id INTEGER PRIMARY KEY CHECK(id=1), device_id TEXT NOT NULL);');
  function current(owner: string, projectId: string) {
    return db.getFirstSync<InspectionSession>('SELECT * FROM inspection_session WHERE owner=? AND project_id=? ORDER BY rowid DESC LIMIT 1', owner, projectId);
  }
  return {
    current,
    device(candidate: string) {
      db.runSync('INSERT OR IGNORE INTO capture_device(id,device_id) VALUES(1,?)', candidate);
      return db.getFirstSync<{device_id: string}>('SELECT device_id FROM capture_device WHERE id=1')!.device_id;
    },
    start(owner: string, projectId: string, id: string, deviceId: string, startedAt: string) {
      // Resume the current visit. Ending visits is a separate workflow.
      const existing = current(owner, projectId);
      if (existing) return existing;
      db.runSync('INSERT INTO inspection_session(id,owner,project_id,device_id,started_at) VALUES(?,?,?,?,?)',
        id, owner, projectId, deviceId, startedAt);
      return current(owner, projectId)!;
    },
    save(owner: string, sessionId: string, point: Capture, photo: string, hash: string) {
      db.execSync('BEGIN IMMEDIATE');
      try {
        const session = db.getFirstSync<InspectionSession>('SELECT * FROM inspection_session WHERE id=? AND owner=? AND project_id=?',
          sessionId, owner, point.project_id);
        if (!session) throw new Error('Start an inspection session for this project before saving.');
        if (!Number.isSafeInteger(session.next_number) || session.next_number < 1 || session.next_number > 2147483647) throw new Error('Session observation number limit reached.');
        const numbered = { ...point, session_client_uuid: session.id, session_device_id: session.device_id,
          session_started_at: session.started_at, observation_number: session.next_number };
        db.runSync('INSERT INTO observation(id,owner,point,photo,hash) VALUES(?,?,?,?,?)',
          point.client_uuid, owner, JSON.stringify(numbered), photo, hash);
        db.runSync('UPDATE inspection_session SET next_number=next_number+1 WHERE id=?', sessionId);
        db.execSync('COMMIT');
        return numbered;
      } catch (error) {
        db.execSync('ROLLBACK');
        throw error;
      }
    },
  };
}
