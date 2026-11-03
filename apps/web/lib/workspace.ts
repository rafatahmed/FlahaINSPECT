export type Role = 'manager' | 'inspector' | 'client';
export type Account = { role: Role; email?: string };

export function isRole(value: unknown): value is Role {
  return value === 'manager' || value === 'inspector' || value === 'client';
}

export const home = { manager: '/dashboard', inspector: '/projects', client: '/client' } as const;
const permissions: Record<string, readonly Role[]> = {
  '/dashboard': ['manager'],
  '/users': ['manager'],
  '/reports': ['manager'],
  '/projects': ['manager', 'inspector'],
  '/points': ['manager', 'inspector'],
  '/client': ['client'],
};

export function mayOpen(role: Role, pathname: string) {
  const section = '/' + pathname.split('/')[1];
  return permissions[section]?.includes(role) === true;
}

export function mayUseStaffApi(role: Role, method: string, path: string) {
  if (role === 'manager') return true;
  if (role !== 'inspector' || method !== 'GET') return false;
  const pathname = path.split('?')[0];
  return /^\/projects(?:\/[^/]+\/stats)?$/.test(pathname)
    || /^\/inspection-points(?:\/[^/]+)?$/.test(pathname)
    || /^\/photos\/[^/]+$/.test(pathname);
}

export function afterLogin(role: Role, next?: string) {
  if (!next || !next.startsWith('/')) return home[role];
  const base = 'https://workspace.invalid';
  try {
    const url = new URL(next, base);
    if (url.origin === base && mayOpen(role, url.pathname)) {
      return url.pathname + url.search + url.hash;
    }
  } catch { /* Fall back to this account's workspace. */ }
  return home[role];
}
