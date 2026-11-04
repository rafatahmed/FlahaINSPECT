import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { api, origin } from './api';
import { createSessionStore } from './session-store';

export type Category = 'normal' | 'defect' | 'note';
type Point = { client_uuid: string; project_id: string; category: Category; note: string;
  captured_at: string; latitude: number; longitude: number; accuracy_m: number | null; location_adjusted?: boolean };
export type Row = { id: string; point: string; photo: string; hash: string; upload: string | null; ready: number };
export const db = SQLite.openDatabaseSync('field.db');
db.execSync(`CREATE TABLE IF NOT EXISTS observation (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL, point TEXT NOT NULL, photo TEXT NOT NULL,
  hash TEXT NOT NULL, upload TEXT, ready INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS project (owner TEXT PRIMARY KEY, id TEXT NOT NULL, name TEXT NOT NULL);`);
export const sessions = createSessionStore(db);
export const startInspectionSession = (owner: string, projectId: string) =>
  sessions.start(owner, projectId, Crypto.randomUUID(), sessions.device(Crypto.randomUUID()), new Date().toISOString());
export const photoFile = (id: string) => new File(Paths.document, id + '.jpg');
export const list = (owner: string) => db.getAllSync<Row>('SELECT * FROM observation WHERE owner=? ORDER BY rowid DESC', owner);

export async function save(owner: string, point: Point, uri: string) {
  const session = sessions.current(owner, point.project_id);
  if (!session) throw new Error('Start an inspection session before saving.');
  const photo = Crypto.randomUUID();
  const file = photoFile(photo);
  new File(uri).copy(file);
  try {
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await file.bytes());
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    sessions.save(owner, session.id, point, photo, hash);
  } catch (error) {
    file.delete();
    throw error;
  }
}

async function syncEvidence(row: Row, onProgress?: (status: string) => void) {
  const point: Point = JSON.parse(row.point);
  onProgress?.('Sending observation...');
  const accepted = await api('/inspection-points', point);
  const numbered = point as Point & {session_client_uuid?: string; observation_number?: number};
  if (numbered.session_client_uuid && (accepted.point?.session_client_uuid !== numbered.session_client_uuid ||
      accepted.point?.observation_number !== numbered.observation_number)) {
    throw new Error('This API does not confirm session numbering. Your evidence remains on this phone.');
  }
  onProgress?.('Observation accepted - preparing photo');
  const file = photoFile(row.photo);
  const { photo } = await api('/photos', { client_uuid: row.photo, inspection_point_client_uuid: row.id,
    project_id: point.project_id, session_device_id: (point as Point & {session_device_id?:string}).session_device_id, byte_size: file.size, sha256: row.hash, content_type: 'image/jpeg' });
  if (photo.status !== 'ready' && photo.status !== 'processing') {
    if (!photo.upload_token || !photo.upload_url) throw new Error('Photo is ' + photo.status);
    const headers = { Authorization: 'Bearer ' + photo.upload_token, 'Tus-Resumable': '1.0.0' };
    const endpoint = new URL(photo.upload_url, origin);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) {
      throw new Error('The pilot API must provide a secure HTTPS photo upload address.');
    }
    let url = row.upload;
    if (!url && photo.tus_upload_id) {
      url = new URL(encodeURIComponent(photo.tus_upload_id), endpoint).href;
    }
    if (!url) {
      const meta = { filetype: 'image/jpeg', photo_client_uuid: row.photo, authorization: photo.upload_token };
      const created = await fetch(endpoint.href, { method: 'POST', headers: { ...headers,
        'Upload-Length': String(file.size), 'Upload-Metadata': Object.entries(meta).map(([k,v]) => k + ' ' + btoa(v)).join(',') } });
      const location = created.headers.get('location');
      if (!created.ok || !location) throw new Error('Upload creation failed (' + created.status + ').');
      url = new URL(location, endpoint).href;
    }
    if (new URL(url).origin !== endpoint.origin) throw new Error('Unexpected upload origin.');
    db.runSync('UPDATE observation SET upload=? WHERE id=?', url, row.id);
    const tunnel = __DEV__ && process.env.EXPO_PUBLIC_API_ORIGIN === 'metro-pilot' && process.env.EXPO_PUBLIC_PILOT_SYNC === '1';
    const resource = new URL(url).pathname.split('/').pop()!;
    const transferUrl = (step: 'offset' | 'chunk') => tunnel
      ? new URL('/v1/phone-upload/' + step + '/' + resource, endpoint).href : url;
    const head = await fetch(transferUrl('offset'), { method: tunnel ? 'POST' : 'HEAD', headers });
    const offset = head.headers.get('upload-offset');
    if (!head.ok || offset === null || !/^\d+$/.test(offset) || Number(offset) > file.size) throw new Error('Cannot resume photo upload.');
    const bytes = await file.bytes();
    const showOffset = (accepted: number) =>
      onProgress?.('Observation accepted - photo upload ' + Math.floor(100 * accepted / Math.max(1, bytes.length)) + '%');
    showOffset(Number(offset));
    for (let start = Number(offset); start < bytes.length;) {
      const end = Math.min(start + 2 * 1024 * 1024, bytes.length);
      const res = await fetch(transferUrl('chunk'), { method: tunnel ? 'POST' : 'PATCH', headers: { ...headers, 'Upload-Offset': String(start),
        'Content-Type': 'application/offset+octet-stream' }, body: bytes.slice(start, end).buffer });
      if (!res.ok || Number(res.headers.get('upload-offset')) !== end) throw new Error('Photo upload interrupted. Retry Sync.');
      start = end;
      showOffset(start);
    }
  }
  onProgress?.('Checking photo status...');
  const status = (await api('/photos/' + photo.id)).photo.status;
  if (status === 'ready') db.runSync('UPDATE observation SET ready=1 WHERE id=?', row.id);
  return status as string;
}

// Preserve local failure information across relaunch; server reports it as last known state.
db.execSync('CREATE TABLE IF NOT EXISTS observation_failure(id TEXT PRIMARY KEY,message TEXT NOT NULL);');
export const localSessions = (owner: string, projectId: string) => db.getAllSync<import('./session-store').InspectionSession>(
  'SELECT s.*,l.ended_at,l.manifest,l.sequence FROM inspection_session s LEFT JOIN session_lifecycle l ON l.id=s.id WHERE s.owner=? AND s.project_id=? ORDER BY s.rowid DESC',owner,projectId);
export async function reconcileSession(owner: string, id: string) {
 const visit=db.getFirstSync<import('./session-store').InspectionSession>('SELECT s.*,l.ended_at,l.manifest,l.sequence FROM inspection_session s LEFT JOIN session_lifecycle l ON l.id=s.id WHERE s.owner=? AND s.id=?',owner,id);
 if(!visit) throw new Error('Inspection session not found on this phone.');
 await api('/inspection-sessions',{client_uuid:id,project_id:visit.project_id,device_id:visit.device_id,started_at:visit.started_at});
 if(visit.ended_at) await api('/inspection-sessions/'+id+'/end',{device_id:visit.device_id,ended_at:visit.ended_at,allocated_count:visit.next_number-1,observations:JSON.parse(visit.manifest!)});
 const rows=list(owner).filter(row=>JSON.parse(row.point).session_client_uuid===id);
 const pending=rows.filter(row=>!row.ready).length;
 const failed=rows.filter(row=>!row.ready && db.getFirstSync('SELECT 1 FROM observation_failure WHERE id=?',row.id)).length;
 db.runSync('INSERT INTO session_lifecycle(id,sequence) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET sequence=sequence+1',id);
 const sequence=db.getFirstSync<{sequence:number}>('SELECT sequence FROM session_lifecycle WHERE id=?',id)!.sequence;
 const complete=!!visit.ended_at && pending===0 && JSON.parse(visit.manifest!).length===visit.next_number-1;
 return (await api('/inspection-sessions/'+id+'/sync-state',{device_id:visit.device_id,sequence,pending,failed,complete})).session;
}
export async function sync(row: Row,onProgress?: (status:string)=>void) {
 const owner=db.getFirstSync<{owner:string}>('SELECT owner FROM observation WHERE id=?',row.id)?.owner;
 const sessionId=JSON.parse(row.point).session_client_uuid as string|undefined;
 if(!owner) throw new Error('Observation not found on this phone.');
 try {
  if(sessionId) await reconcileSession(owner,sessionId);
  const result=await syncEvidence(row,onProgress);
  db.runSync('DELETE FROM observation_failure WHERE id=?',row.id);
  if(sessionId) await reconcileSession(owner,sessionId);
  return result;
 } catch(error) {
  db.runSync('INSERT OR REPLACE INTO observation_failure(id,message) VALUES(?,?)',row.id,String(error));
  if(sessionId) await reconcileSession(owner,sessionId).catch(()=>{});
  throw error;
 }
}
