import { forbidden, redirect } from 'next/navigation';
import { pageUpstream } from './upstream';
import { isRole, mayOpen, type Account } from './workspace';

export async function pageAccount(path?: string): Promise<Account> {
  const { status, json } = await pageUpstream('GET', '/auth/me');
  if (status === 401) redirect('/login');
  if (status === 403) forbidden();
  if (status !== 200) throw new Error('Could not verify your account.');
  const user = (json as { user?: Account } | null)?.user;
  if (!user || !isRole(user.role) || (path && !mayOpen(user.role, path))) forbidden();
  return user;
}

export function checkPageResponse(status: number) {
  if (status === 401) redirect('/login');
  if (status === 403) forbidden();
  if (status >= 400) throw new Error('Could not load workspace data.');
}
