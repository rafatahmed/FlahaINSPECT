import { PointEditor } from '@/components/point-editor';
import { Shell } from '@/components/shell';
import { upstream } from '@/lib/upstream';

export default async function PointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ json: meJson }, { json: pointJson, status }] = await Promise.all([
    upstream('GET', '/auth/me'),
    upstream('GET', `/inspection-points/${id}`),
  ]);
  const email = (meJson as { user?: { email?: string } } | null)?.user?.email;
  const point = (pointJson as { point?: Record<string, unknown> } | null)?.point;
  return (
    <Shell email={email}>
      {status >= 400 || !point ? (
        <p>Point not found.</p>
      ) : (
        <PointEditor point={point as never} />
      )}
    </Shell>
  );
}