import { PointEditor } from '@/components/point-editor';
import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { Shell } from '@/components/shell';
import { stripSignedMedia } from '@/lib/report-ui';
import { pageUpstream } from '@/lib/upstream';

export default async function PointPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await pageAccount('/points');
  const { json: pointJson, status } = await pageUpstream('GET', `/inspection-points/${id}`);
  if (status !== 404) checkPageResponse(status);
  const point = stripSignedMedia(
    (pointJson as { point?: Record<string, unknown> } | null)?.point,
  ) as Record<string, unknown> | undefined;
  return (
    <Shell account={account}>
      {status >= 400 || !point ? (
        <p>Point not found.</p>
      ) : (
        <PointEditor point={point as never} canEdit={account.role === 'manager'} />
      )}
    </Shell>
  );
}