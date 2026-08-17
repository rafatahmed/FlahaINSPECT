import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';

const NAME_MAX = 200;
const EMAIL_MAX = 254;
const CODE_RE = /^[A-Za-z0-9._-]+$/;

export function normalizeEmail(email: string): string {
  const value = email.trim().toLowerCase();
  if (!value || value.length > EMAIL_MAX || !value.includes('@')) {
    throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'Invalid email');
  }
  return value;
}

export function normalizeName(name: string): string {
  const value = name.trim();
  if (!value || value.length > NAME_MAX) {
    throw new ApiException(ErrorCode.TEXT_TOO_LONG, undefined, 'Name must be 1–200 characters');
  }
  return value;
}

export function normalizeProjectCode(code: string | undefined | null): string | null {
  if (code == null || code === '') return null;
  const value = code.trim();
  if (value.length > NAME_MAX || !CODE_RE.test(value)) {
    throw new ApiException(
      ErrorCode.VALIDATION_ERROR,
      undefined,
      'Project code must be 1–200 characters in [A-Za-z0-9._-]',
    );
  }
  return value;
}

export function assertCreatableRole(role: 'inspector' | 'manager' | 'client'): void {
  if (role === 'client' && process.env.CLIENT_ROLE_ENABLED !== 'true') {
    throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, 'Client role is disabled');
  }
}

export function shouldBumpTokenVersion(previousRole: string, nextRole: string | undefined): boolean {
  return nextRole !== undefined && nextRole !== previousRole;
}
