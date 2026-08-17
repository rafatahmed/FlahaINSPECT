export const PRODUCT = 'FlahaINSPECT';
export const API_PREFIX = '/v1';

export type PublicUser = {
  id: string;
  email: string;
  full_name: string;
  role: 'inspector' | 'manager' | 'client';
  locale: string;
  is_active: boolean;
};

export type SessionResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: PublicUser;
};

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, unknown> };
};

export class InspectApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | null,
  ) {
    super(body?.error.message ?? `HTTP ${status}`);
  }
}

export type InspectClientOptions = {
  baseUrl: string;
  getAccessToken?: () => string | undefined;
};

export function createInspectClient(options: InspectClientOptions) {
  const prefix = `${options.baseUrl.replace(/\/$/, '')}${API_PREFIX}`;

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    auth = true,
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['content-type'] = 'application/json';
    const token = auth ? options.getAccessToken?.() : undefined;
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await fetch(`${prefix}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (res.status === 204) {
      return undefined as T;
    }
    const json = (await res.json().catch(() => null)) as T | ApiErrorBody | null;
    if (!res.ok) {
      throw new InspectApiError(res.status, json as ApiErrorBody | null);
    }
    return json as T;
  }

  return {
    login: (email: string, password: string) =>
      request<SessionResponse>('POST', '/auth/login', { email, password }, false),
    refresh: (refresh_token: string) =>
      request<SessionResponse>('POST', '/auth/refresh', { refresh_token }, false),
    logout: (refresh_token: string) =>
      request<void>('POST', '/auth/logout', { refresh_token }, false),
    getMe: () =>
      request<{ user: PublicUser; min_app_version: string; server_time: string }>(
        'GET',
        '/auth/me',
      ),
    setPassword: (user_id: string, new_password: string) =>
      request<{ user: PublicUser }>('POST', '/auth/set-password', { user_id, new_password }),
    listUsers: () => request<{ items: PublicUser[] }>('GET', '/users'),
    createUser: (body: {
      email: string;
      full_name: string;
      password: string;
      role?: PublicUser['role'];
      locale?: string;
    }) => request<{ user: PublicUser }>('POST', '/users', body),
    patchUser: (
      id: string,
      body: Partial<Pick<PublicUser, 'full_name' | 'role' | 'is_active' | 'locale'>>,
    ) => request<{ user: PublicUser }>('PATCH', `/users/${id}`, body),
    listProjects: (archived?: 'false') =>
      request<{ items: unknown[] }>(
        'GET',
        archived === 'false' ? '/projects?archived=false' : '/projects',
      ),
    createProject: (body: Record<string, unknown>) =>
      request<{ project: unknown }>('POST', '/projects', body),
    getProject: (id: string) => request<{ project: unknown; members: unknown[] }>('GET', `/projects/${id}`),
    patchProject: (id: string, body: Record<string, unknown>) =>
      request<{ project: unknown }>('PATCH', `/projects/${id}`, body),
    archiveProject: (id: string) => request<{ project: unknown }>('POST', `/projects/${id}/archive`),
    deleteProject: (id: string) => request<{ ok: true }>('DELETE', `/projects/${id}`),
    addProjectMember: (id: string, body: { user_id: string; member_role?: PublicUser['role'] }) =>
      request<{ project: unknown; members: unknown[] }>('POST', `/projects/${id}/members`, body),
    removeProjectMember: (id: string, userId: string) =>
      request<{ ok: true }>('DELETE', `/projects/${id}/members/${userId}`),
    getProjectStats: (id: string) => request<Record<string, unknown>>('GET', `/projects/${id}/stats`),
    createInspectionPoint: (body: Record<string, unknown>) =>
      request<{ point: unknown }>('POST', '/inspection-points', body),
    listInspectionPoints: (projectId: string, query?: Record<string, string>) => {
      const qs = new URLSearchParams({ project_id: projectId, ...query }).toString();
      return request<{ items: unknown[] }>('GET', `/inspection-points?${qs}`);
    },
    getInspectionPoint: (id: string) => request<{ point: unknown }>('GET', `/inspection-points/${id}`),
    getInspectionPointByClient: (clientUuid: string) =>
      request<{ point: unknown }>('GET', `/inspection-points/by-client/${clientUuid}`),
    patchInspectionPoint: (id: string, body: Record<string, unknown>) =>
      request<{ point: unknown }>('PATCH', `/inspection-points/${id}`, body),
    deleteInspectionPoint: (id: string) =>
      request<{ ok: true }>('DELETE', `/inspection-points/${id}`),
    registerPhoto: (body: Record<string, unknown>) =>
      request<{ photo: unknown }>('POST', '/photos', body),
    getPhoto: (id: string) => request<{ photo: unknown }>('GET', `/photos/${id}`),
  };
}

export type InspectClient = ReturnType<typeof createInspectClient>;
