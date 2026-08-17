'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_LEGEND } from '@/lib/category';
import type { MapPoint } from './dashboard-map';

const DashboardMap = dynamic(() => import('./dashboard-map').then((m) => m.DashboardMap), {
  ssr: false,
});

type Project = { id: string; name: string; is_archived?: boolean };
type Stats = {
  point_count?: number;
  photos_ready?: number;
  by_category?: Record<string, number>;
};
type Point = MapPoint & {
  captured_at?: string;
  inspector_id?: string;
  photos?: Array<{ id: string; status: string }>;
};

export function DashboardClient({
  projects,
  initialProjectId,
}: {
  projects: Project[];
  initialProjectId?: string;
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(initialProjectId ?? projects[0]?.id ?? '');
  const [stats, setStats] = useState<Stats>({});
  const [points, setPoints] = useState<Point[]>([]);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!projectId) return;
    const qs = new URLSearchParams({ project_id: projectId });
    if (category) qs.set('category', category);
    if (status) qs.set('status', status);
    void Promise.all([
      fetch(`/bff/projects/${projectId}/stats`).then((r) => r.json()),
      fetch(`/bff/inspection-points?${qs}`).then((r) => r.json()),
    ]).then(([s, list]) => {
      setStats(s ?? {});
      setPoints((list?.items ?? []) as Point[]);
    });
  }, [projectId, category, status]);

  const pendingPhotos = Math.max(0, (stats.point_count ?? 0) - (stats.photos_ready ?? 0));
  const mapPoints = useMemo(() => points, [points]);

  return (
    <>
      <div className="header">
        <label>
          Project{' '}
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              router.replace(`/dashboard?project=${e.target.value}`);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.is_archived ? ' (archived)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="cards">
        <div className="card">
          <span>Points</span>
          <strong>{stats.point_count ?? 0}</strong>
        </div>
        <div className="card">
          <span>Open defects</span>
          <strong>{stats.by_category?.defect ?? 0}</strong>
        </div>
        <div className="card">
          <span>Pending photos</span>
          <strong>{pendingPhotos}</strong>
        </div>
      </div>
      <div className="legend">
        {CATEGORY_LEGEND.map((c) => (
          <span key={c.id}>
            <i className="swatch" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
      <div className="layout-split">
        <DashboardMap points={mapPoints} />
        <div>
          <div className="filters">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {CATEGORY_LEGEND.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="open">open</option>
              <option value="in_progress">in_progress</option>
              <option value="resolved">resolved</option>
              <option value="closed">closed</option>
            </select>
          </div>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Category</th>
                <th>Status</th>
                <th>Inspector</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} onClick={() => router.push(`/points/${p.id}`)} style={{ cursor: 'pointer' }}>
                  <td>{p.captured_at ? new Date(p.captured_at).toLocaleString() : '—'}</td>
                  <td>{p.category}</td>
                  <td>{p.status}</td>
                  <td>{p.inspector_id?.slice(0, 8) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
