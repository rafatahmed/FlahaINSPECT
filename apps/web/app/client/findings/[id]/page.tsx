import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/shell';
import { isUuid } from '@/lib/ids';
import { formatCapturedAt } from '@/lib/datetime';
import { pageAccount, checkPageResponse } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';

export default async function ClientFinding({ params }: { params: Promise<{ id: string }> }) {
  const account = await pageAccount('/client');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { status, json } = await pageUpstream('GET', `/client/findings/${id}`);
  if (status === 404) notFound();
  checkPageResponse(status);
  const { finding } = json as { finding: { summary: string; category: string; project_id: string; released_at: string } };
  return <Shell account={account}>
    <Link href={`/client/projects/${finding.project_id}`}>Project findings</Link>
    <h1>Released finding</h1>
    <p>{finding.summary}</p>
    <p>{finding.category} · Released {formatCapturedAt(finding.released_at)}</p>
    <img className="media" src={`/bff/client/findings/${id}/photo`} alt="Released finding evidence" />
  </Shell>;
}
