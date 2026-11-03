import * as SQLite from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { api, origin } from './api';

export type Category = 'normal' | 'defect' | 'note';
type Point = { client_uuid: string; project_id: string; category: Category; note: string;
  captured_at: string; latitude: number; longitude: number; accuracy_m: number | null; location_adjusted?: boolean };
export type Row = { id: string; point: string; photo: string; hash: string; upload: string | null; ready: number };
export const db = SQLite.openDatabaseSync('field.db');
db.execSync(`CREATE TABLE IF NOT EXISTS observation (
  id TEXT PRIMARY KEY, owner TEXT NOT NULL, point TEXT NOT NULL, photo TEXT NOT NULL,
  hash TEXT NOT NULL, upload TEXT, ready INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS project (owner TEXT PRIMARY KEY, id TEXT NOT NULL, name TEXT NOT NULL);`);
export const photoFile = (id: string) => new File(Paths.document, id + '.jpg');
export const list = (owner: string) => db.getAllSync<Row>('SELECT * FROM observation WHERE owner=? ORDER BY rowid DESC', owner);

export async function save(owner: string, point: Point, uri: string) {
  const photo = Crypto.randomUUID();
  const file = photoFile(photo);
  new File(uri).copy(file);
  try {
    const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, await file.bytes());
    const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    db.runSync('INSERT INTO observation(id,owner,point,photo,hash) VALUES (?,?,?,?,?)',
      point.client_uuid, owner, JSON.stringify(point), photo, hash);
  } catch (error) {
    file.delete();
    throw error;
  }
}

export async function sync(row: Row, onProgress?: (status: string) => void) {
  const point: Point = JSON.parse(row.point);
  onProgress?.('Sending observation...');
  await api('/inspection-points', point);
  onProgress?.('Observation accepted - preparing photo');
  const file = photoFile(row.photo);
  const { photo } = await api('/photos', { client_uuid: row.photo, inspection_point_client_uuid: row.id,
    project_id: point.project_id, byte_size: file.size, sha256: row.hash, content_type: 'image/jpeg' });
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
