import type { AuthUser } from '../auth/auth.types';

export type ProjectAccess = 'ok' | 'not_found' | 'forbidden';

export function projectAccess(
  user: AuthUser,
  project: { deletedAt: Date | null } | null,
  isMember: boolean,
): ProjectAccess {
  if (!project || project.deletedAt) {
    return 'not_found';
  }
  if (user.role === 'manager') {
    return 'ok';
  }
  if (user.role === 'inspector' && isMember) {
    return 'ok';
  }
  return 'forbidden';
}

export function canMutateProject(user: AuthUser): boolean {
  return user.role === 'manager';
}
