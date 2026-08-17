import { extractBearer } from './upload-token';

export type TusUpload = {
  ID?: string;
  Size?: number;
  MetaData?: Record<string, string>;
  Storage?: { Key?: string };
};

export type TusHookBody = {
  Type?: string;
  Upload?: TusUpload;
  Event?: {
    Upload?: TusUpload;
    HTTPRequest?: {
      Header?: Record<string, string | string[] | undefined>;
    };
  };
};

/** tusd v2 nests the upload under Event; older fixtures keep it at the root. */
export function tusUploadFromHook(body: TusHookBody): TusUpload {
  return body.Event?.Upload ?? body.Upload ?? {};
}

export function tusRequestHeader(body: TusHookBody, name: string): string | undefined {
  const headers = body.Event?.HTTPRequest?.Header;
  if (!headers) return undefined;
  const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) return undefined;
  const value = headers[key];
  return Array.isArray(value) ? value[0] : value;
}

/** Bearer on the TUS request, hook Authorization, or raw metadata token (mobile). */
export function uploadTokenFromHook(
  hookAuthorization: string | undefined,
  body: TusHookBody,
): string | undefined {
  const upload = tusUploadFromHook(body);
  return (
    extractBearer(hookAuthorization) ??
    extractBearer(tusRequestHeader(body, 'authorization')) ??
    upload.MetaData?.authorization
  );
}
