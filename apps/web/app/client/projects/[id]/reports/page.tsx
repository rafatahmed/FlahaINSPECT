import { notFound } from 'next/navigation';
import { Shell } from '@/components/shell';
import { pageAccount, checkPageResponse } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';
import { isUuid } from '@/lib/ids';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const account = await pageAccount('/client');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { status, json } = await pageUpstream(
    'GET',
    `/client/projects/${id}/reports`,
  );
  if (status === 404) notFound();
  checkPageResponse(status);
  const { items } = json as {
    items: { id: string; revision: number; point_count: number }[];
  };
  return (
    <Shell account={account}>
      <h1>Issued reports</h1>
      {items.length ? (
        <ul>
          {items.map((r) => (
            <li key={r.id}>
              <a href={`/client/reports/${r.id}`}>Revision {r.revision}</a> ·{' '}
              {r.point_count} findings
            </li>
          ))}
        </ul>
      ) : (
        <p>No reports issued yet.</p>
      )}
    </Shell>
  );
}
