type Value = string | number | null;
export type SessionDatabase = {
  execSync(sql: string): void;
  getFirstSync<T>(sql: string, ...args: Value[]): T | null;
  runSync(sql: string, ...args: Value[]): unknown;
};
export type InspectionSession = {
  id: string; owner: string; project_id: string; device_id: string; started_at: string; next_number: number; ended_at?: string | null; capture_closed_at?: string | null; manifest?: string | null; sequence?: number;
};
type Capture = { client_uuid: string; project_id: string; [key: string]: unknown };

// Additive tables: existing observation JSON, files and TUS resources remain untouched.
export function createSessionStore(db: SessionDatabase) {
  db.execSync('CREATE TABLE IF NOT EXISTS inspection_session (id TEXT PRIMARY KEY, owner TEXT NOT NULL, project_id TEXT NOT NULL, device_id TEXT NOT NULL, started_at TEXT NOT NULL, next_number INTEGER NOT NULL DEFAULT 1); CREATE TABLE IF NOT EXISTS capture_device (id INTEGER PRIMARY KEY CHECK(id=1), device_id TEXT NOT NULL);');
  db.execSync(`CREATE TABLE IF NOT EXISTS session_capture_closed (id TEXT PRIMARY KEY, closed_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS session_lifecycle (id TEXT PRIMARY KEY, ended_at TEXT, manifest TEXT, sequence INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS session_allocation (session_id TEXT NOT NULL, number INTEGER NOT NULL, observation_id TEXT NOT NULL, photo_id TEXT NOT NULL, PRIMARY KEY(session_id,number));
    INSERT OR IGNORE INTO session_allocation(session_id,number,observation_id,photo_id)
      SELECT json_extract(point,'$.session_client_uuid'),json_extract(point,'$.observation_number'),id,photo FROM observation
      WHERE json_valid(point) AND json_extract(point,'$.session_client_uuid') IS NOT NULL;`);
  function end(owner: string, id: string, endedAt: string) {
    db.execSync('BEGIN IMMEDIATE');
    try {
      const session = db.getFirstSync<InspectionSession>('SELECT s.*,l.ended_at,l.manifest FROM inspection_session s LEFT JOIN session_lifecycle l ON l.id=s.id WHERE s.id=? AND s.owner=?',id,owner);
      if (!session) throw new Error('Inspection session not found.');
      if (!session.ended_at) {
        if (session.next_number > 10001) {
          // Upgrade escape hatch: stop capture without inventing a server inventory.
          // Existing evidence can keep syncing as active; server completeness stays unknown.
          db.runSync('INSERT OR IGNORE INTO session_capture_closed(id,closed_at) VALUES(?,?)',id,endedAt);
          session.capture_closed_at=db.getFirstSync<{closed_at:string}>('SELECT closed_at FROM session_capture_closed WHERE id=?',id)!.closed_at;
          db.execSync('COMMIT'); return session;
        }
        const inventory = db.getFirstSync<{manifest: string}>(`SELECT json_group_array(json_object('client_uuid',observation_id,'observation_number',number,'photo_client_uuid',photo_id,'disposition',CASE WHEN EXISTS(SELECT 1 FROM observation o WHERE o.id=a.observation_id) THEN 'saved' ELSE 'deleted' END)) AS manifest FROM (SELECT * FROM session_allocation WHERE session_id=? ORDER BY number) a`,id)!;
        db.runSync('INSERT INTO session_lifecycle(id,ended_at,manifest) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET ended_at=excluded.ended_at,manifest=excluded.manifest',id,endedAt,inventory.manifest);
        session.ended_at=endedAt; session.manifest=inventory.manifest;
      }
      db.execSync('COMMIT'); return session;
    } catch(error) { db.execSync('ROLLBACK'); throw error; }
  }
  function current(owner: string, projectId: string) {
    return db.getFirstSync<InspectionSession>('SELECT * FROM inspection_session WHERE owner=? AND project_id=? AND NOT EXISTS(SELECT 1 FROM session_capture_closed c WHERE c.id=inspection_session.id) AND NOT EXISTS(SELECT 1 FROM session_lifecycle l WHERE l.id=inspection_session.id AND l.ended_at IS NOT NULL) ORDER BY rowid DESC LIMIT 1', owner, projectId);
  }
  return {
    current, end,
    device(candidate: string) {
      db.runSync('INSERT OR IGNORE INTO capture_device(id,device_id) VALUES(1,?)', candidate);
      return db.getFirstSync<{device_id: string}>('SELECT device_id FROM capture_device WHERE id=1')!.device_id;
    },
    start(owner: string, projectId: string, id: string, deviceId: string, startedAt: string) {
      // Resume only an active visit; ended sessions retain their allocation history.
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
        if (db.getFirstSync('SELECT 1 FROM session_capture_closed WHERE id=?',sessionId)) throw new Error('Capture for this session has ended. Start another session.');
        if (db.getFirstSync('SELECT 1 FROM session_lifecycle WHERE id=? AND ended_at IS NOT NULL',sessionId)) throw new Error('This session has ended. Start another session.');
        if (!session) throw new Error('Start an inspection session for this project before saving.');
        if (!Number.isSafeInteger(session.next_number) || session.next_number < 1 || session.next_number > 10000) throw new Error('Session observation number limit reached.');
        const numbered = { ...point, session_client_uuid: session.id, session_device_id: session.device_id,
          session_started_at: session.started_at, observation_number: session.next_number };
        db.runSync('INSERT INTO observation(id,owner,point,photo,hash) VALUES(?,?,?,?,?)',
          point.client_uuid, owner, JSON.stringify(numbered), photo, hash);
        db.runSync('INSERT INTO session_allocation(session_id,number,observation_id,photo_id) VALUES(?,?,?,?)',sessionId,session.next_number,point.client_uuid,photo);
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
