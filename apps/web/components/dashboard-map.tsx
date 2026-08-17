'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { categoryColor, categoryLabel } from '@/lib/category';
import 'leaflet/dist/leaflet.css';

export type MapPoint = {
  id: string;
  latitude: number;
  longitude: number;
  category: string;
  status: string;
};

export function DashboardMap({ points }: { points: MapPoint[] }) {
  const center: [number, number] = points[0]
    ? [points[0].latitude, points[0].longitude]
    : [25.286, 51.534];
  const tiles =
    process.env.NEXT_PUBLIC_TILE_PROVIDER_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  useEffect(() => {
    // leaflet default icon paths break under webpack; we only use CircleMarker.
  }, []);

  return (
    <MapContainer center={center} zoom={13} className="map" scrollWheelZoom>
      <TileLayer attribution="&copy; map contributors" url={tiles} />
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.latitude, p.longitude]}
          radius={8}
          pathOptions={{ color: categoryColor(p.category), fillOpacity: 0.9 }}
        >
          <Popup>
            <a href={`/points/${p.id}`}>
              {categoryLabel(p.category)} · {p.status}
            </a>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
