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
    || /^\/photos\/[^/]+\/(?:file|thumbnail)$/.test(pathname);
}

export function safeNextPath(raw: string | null | undefined): string {
  const fallback = '/';
  if (!raw?.startsWith('/') || raw.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(raw)) return fallback;
  const base = 'https://workspace.invalid';
  try {
    const url = new URL(raw, base);
    // Revalidate the normalized path before returning a relative Location.
    if (url.origin !== base || !/^\/(?:$|(?:dashboard|projects|users|reports|points|client)(?:\/|$))/.test(url.pathname)) {
      return fallback;
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

export function afterLogin(role: Role, next?: string) {
  const destination = safeNextPath(next);
  const pathname = destination.split(/[?#]/, 1)[0];
  return mayOpen(role, pathname) ? destination : home[role];
}
