import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'inspector' | 'manager' | 'client'>) =>
  SetMetadata(ROLES_KEY, roles);
