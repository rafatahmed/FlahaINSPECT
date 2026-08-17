const COORD_EPS = 1e-6;
const ACC_EPS = 0.05;

export type FieldOwnedPayload = {
  projectId: string;
  inspectorId: string;
  category: string;
  note: string | null;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  capturedAt: Date;
  locationAdjusted: boolean;
  locationSource: string;
};

export function notesEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  return (a ?? null) === (b ?? null);
}

export function fieldPayloadEqual(existing: FieldOwnedPayload, incoming: FieldOwnedPayload): boolean {
  return (
    existing.projectId === incoming.projectId &&
    existing.inspectorId === incoming.inspectorId &&
    existing.category === incoming.category &&
    notesEqual(existing.note, incoming.note) &&
    Math.abs(existing.latitude - incoming.latitude) <= COORD_EPS &&
    Math.abs(existing.longitude - incoming.longitude) <= COORD_EPS &&
    accuracyEqual(existing.accuracyM, incoming.accuracyM) &&
    existing.capturedAt.getTime() === incoming.capturedAt.getTime() &&
    existing.locationAdjusted === incoming.locationAdjusted &&
    existing.locationSource === incoming.locationSource
  );
}

function accuracyEqual(a: number | null, b: number | null): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  return Math.abs(a - b) <= ACC_EPS;
}

export function allowlistDeviceInfo(input: unknown): Record<string, string> | null {
  if (input == null) return null;
  if (typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of ['platform', 'model', 'os', 'app_version'] as const) {
    if (typeof raw[key] === 'string') {
      out[key] = raw[key];
    }
  }
  const json = JSON.stringify(out);
  if (json.length > 4096) {
    return null;
  }
  return Object.keys(out).length ? out : null;
}
