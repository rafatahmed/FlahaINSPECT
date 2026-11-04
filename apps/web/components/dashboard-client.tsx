'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CATEGORY_LEGEND } from '@/lib/category';
import { formatCapturedAt } from '@/lib/datetime';
import type { MapPoint } from '@/lib/map-point';

const DashboardMap = dynamic(() => import('./dashboard-map').then((m) => m.DashboardMap), {
  ssr: false,
  loading: () => <div className="map" aria-hidden />,
});

type Project = { id: string; name: string; is_archived?: boolean };
type Stats = {
  point_count?: number;
  photos_ready?: number;
  open_defect_count?: number;
};
type Point = MapPoint & {
  session_client_uuid?: string | null; observation_number?: number | null;
  captured_at?: string;
  inspector_id?: string;
  photos?: Array<{ id: string; status: string }>;
};

export function DashboardClient({
  projects,
  initialProjectId,
  projectPath = '/dashboard',
}: {
  projects: Project[];
  initialProjectId?: string;
  projectPath?: '/projects' | '/dashboard';
}) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(initialProjectId ?? projects[0]?.id ?? '');
  const [stats, setStats] = useState<Stats>({});
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    setStats({});
    void fetch(`/bff/projects/${projectId}/stats`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : {})
      .then((data) => { if (!controller.signal.aborted) setStats(data); })
      .catch(() => {});
    return () => controller.abort();
  }, [projectId]);

  const pendingPhotos = Math.max(0, (stats.point_count ?? 0) - (stats.photos_ready ?? 0));


  return (
    <>
      <div className="header">
        <label>
          Project{' '}
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              router.replace(`${projectPath}?project=${e.target.value}`);
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
      <h2>Project totals</h2>
      <div className="cards">
        <div className="card">
          <span>Points</span>
          <strong>{stats.point_count ?? 0}</strong>
        </div>
        <div className="card">
          <span>Open defects</span>
          <strong>{stats.open_defect_count ?? 0}</strong>
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
      <div className="filters">
        <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORY_LEGEND.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="open">open</option>
          <option value="in_progress">in_progress</option>
          <option value="resolved">resolved</option>
          <option value="closed">closed</option>
        </select>
      </div>
      {projectId && <ObservationResults key={`${projectId}/${category}/${status}`} {...{ projectId, category, status }} />}
    </>
  );
}

function ObservationResults({ projectId, category, status }: { projectId: string; category: string; status: string }) {
  const router = useRouter();
  const [points, setPoints] = useState<Point[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [request, setRequest] = useState<{ cursor: string | null }>({ cursor: null });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ project_id: projectId });
    if (category) params.set('category', category);
    if (status) params.set('status', status);
    if (request.cursor) params.set('cursor', request.cursor);
    async function loadPage() {
      try {
        const response = await fetch(`/bff/inspection-points?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Observation request failed');
        const page = await response.json();
        if (controller.signal.aborted) return;
        setPoints((previous) => [...previous, ...page.items]);
        setCursor(page.next_cursor);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadPage();
    return () => controller.abort();
  }, [projectId, category, status, request]);

  return (
    <>
      <p role="status">
        Showing {points.length} matching observations in the list and on the map.{' '}
        {loading ? 'Loading observations…' : failed ? 'Could not load observations.' : cursor ? 'More available.' : 'All matches loaded.'}
      </p>
      <div className="layout-split">
        <DashboardMap points={points} />
        <div className="observation-results">
          <div className="observation-table-scroll" role="region" aria-label="Observations" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Session / observation</th>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Inspector</th>
                </tr>
              </thead>
              <tbody>
                {points.map((p) => (
                  <tr key={p.id} onClick={() => router.push(`/points/${p.id}`)} style={{ cursor: 'pointer' }}>
                    <td>{p.session_client_uuid ? p.session_client_uuid + " / " + p.observation_number : "Legacy - session unknown"}</td>
                    <td><a href={`/points/${p.id}`} onClick={(e) => e.stopPropagation()}>{formatCapturedAt(p.captured_at)}</a></td>
                    <td>{p.category}</td>
                    <td>{p.status}</td>
                    <td>{p.inspector_id?.slice(0, 8) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(cursor || failed) && (
            <button disabled={loading} onClick={() => {
              setLoading(true);
              setFailed(false);
              setRequest({ cursor });
            }}>
              {failed ? 'Retry loading observations' : 'Load more observations'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
