import { canMutateProject, projectAccess } from './project-access';
import type { AuthUser } from '../auth/auth.types';

const manager: AuthUser = {
  id: 'm',
  email: 'm@x',
  passwordHash: 'x',
  fullName: 'M',
  role: 'manager',
  locale: 'en',
  isActive: true,
  tokenVersion: 1,
};

const inspector: AuthUser = { ...manager, id: 'i', role: 'inspector' };

describe('projectAccess', () => {
  it('hides soft-deleted projects from everyone', () => {
    expect(
      projectAccess(manager, { deletedAt: new Date() }, true),
    ).toBe('not_found');
  });

  it('lets managers see any live project without membership', () => {
    expect(projectAccess(manager, { deletedAt: null }, false)).toBe('ok');
  });

  it('lets inspectors see only assigned live projects', () => {
    expect(projectAccess(inspector, { deletedAt: null }, true)).toBe('ok');
    expect(projectAccess(inspector, { deletedAt: null }, false)).toBe('forbidden');
  });

  it('restricts mutations to managers', () => {
    expect(canMutateProject(manager)).toBe(true);
    expect(canMutateProject(inspector)).toBe(false);
  });
});
