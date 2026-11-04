import * as SecureStore from 'expo-secure-store';
import { TurboModuleRegistry, type TurboModule } from 'react-native';

// Only a bare HTTPS origin is valid for a credential-bearing pilot.
function pilotOrigin(value?: string) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password &&
        url.pathname === '/' && !url.search && !url.hash) return url.origin;
  } catch { /* An invalid setting leaves the client in bundle-only mode. */ }
  return undefined;
}
interface SourceCodeModule extends TurboModule {
  getConstants(): { scriptURL: string };
}

function apiOrigin() {
  const configured = process.env.EXPO_PUBLIC_API_ORIGIN;
  if (configured !== 'metro-pilot' || !__DEV__) return pilotOrigin(configured);
  // Metro may advertise the bundle over HTTP even when iOS opened its HTTPS tunnel.
  const source = TurboModuleRegistry.get<SourceCodeModule>('SourceCode')?.getConstants().scriptURL;
  if (!source) return undefined;
  const host = new URL(source).hostname;
  return host.endsWith('.on.expo.app') ? 'https://' + host : undefined;
}
export const origin = apiOrigin();
const key = 'flaha-field-session';
export interface Project { id: string; name: string; code?: string | null; description?: string | null; is_archived?: boolean }
export type Role = 'inspector' | 'manager' | 'client';
export type Profile = { id: string; role?: Role; full_name?: string; email?: string };
export interface Session {
  origin: string; user: Profile; access_token: string; refresh_token: string;
}
export class ApiError extends Error {
  constructor(readonly status: number, message = 'API request failed (HTTP ' + status + ').') { super(message); }
}
export async function restore(): Promise<Session | null> {
  if (!origin) return null;
  const saved = await SecureStore.getItemAsync(key);
  const session = saved && JSON.parse(saved);
  return session && session.origin === origin ? session : null;
}
async function request(path: string, token?: string, body?: unknown) {
  if (!origin) throw new Error('Configure the approved HTTPS pilot API to sign in.');
  return fetch(origin + '/v1' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: JSON.stringify(body),
  });
}
async function checked(res: Response) {
  if (!res.ok) {
    const body=await res.json().catch(()=>null);
    if(body?.error?.code==='PROJECT_ARCHIVED') throw new ApiError(res.status, 'This project is archived. Your evidence remains on this phone; ask your manager to restore access.');
    if(res.status===403 || res.status===404) throw new ApiError(res.status, 'Project access or session support is unavailable. Your evidence remains on this phone; contact your manager.');
    throw new ApiError(res.status);
  }
  return res.json();
}
export async function login(email: string, password: string): Promise<Session> {
  const response = await request('/auth/login', undefined, { email, password });
  if (response.status === 401) throw new Error('Email or password is incorrect.');
  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.code === 'ACCOUNT_LOCKED' ? 'Try again in 15 minutes.' : 'Too many attempts. Try again later.');
  }
  const session = { ...await checked(response), origin };
  await SecureStore.setItemAsync(key, JSON.stringify(session));
  return session;
}
export async function api(path: string, body?: unknown) {
  const session = await restore();
  if (!session) throw new Error('Sign in to sync.');
  let res = await request(path, session.access_token, body);
  if (res.status === 401) {
    const next = await checked(await request('/auth/refresh', undefined, { refresh_token: session.refresh_token }));
    await SecureStore.setItemAsync(key, JSON.stringify({ ...session, ...next }));
    res = await request(path, next.access_token, body);
  }
  return checked(res);
}
export const logout = () => SecureStore.deleteItemAsync(key);
