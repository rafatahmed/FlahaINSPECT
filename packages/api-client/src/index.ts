export const PRODUCT = 'FlahaINSPECT';
export const API_PREFIX = '/v1';

export {
  createInspectClient,
  InspectApiError,
  type InspectClient,
  type InspectClientOptions,
  type PublicUser,
  type SessionResponse,
  type DeltaCursor,
  type DeltaPage,
  type DeltaQuery,
} from './client';
