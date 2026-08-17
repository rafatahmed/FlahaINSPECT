import { sql } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { ErrorCode } from '../common/errors';

export type PolygonGeoJson = {
  type: 'Polygon';
  coordinates: number[][][];
};

export function parsePolygon(input: unknown, field: string): PolygonGeoJson {
  if (!input || typeof input !== 'object') {
    throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, `${field} must be a GeoJSON Polygon`);
  }
  const value = input as { type?: string; coordinates?: unknown };
  if (value.type !== 'Polygon' || !Array.isArray(value.coordinates)) {
    throw new ApiException(ErrorCode.VALIDATION_ERROR, undefined, `${field} must be a GeoJSON Polygon`);
  }
  return { type: 'Polygon', coordinates: value.coordinates as number[][][] };
}

export function geomFromGeoJson(poly: PolygonGeoJson) {
  return sql`ST_SetSRID(ST_GeomFromGeoJSON(${JSON.stringify(poly)}), 4326)`;
}

export function asGeoJson(raw: string | null): PolygonGeoJson | null {
  if (!raw) return null;
  return JSON.parse(raw) as PolygonGeoJson;
}
