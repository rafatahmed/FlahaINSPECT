import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Shell } from '@/components/shell';
import { pageAccount, checkPageResponse } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';
import { isUuid } from '@/lib/ids';

export default async function ProjectFindings({ params }: { params: Promise<{ id: string }> }) {
  const account = await pageAccount('/client');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { status, json } = await pageUpstream('GET', `/client/projects/${id}/findings`);
  if (status === 404) notFound();
  checkPageResponse(status);
  const { items } = json as { items: { id: string; summary: string }[] };
  return <Shell account={account}>
    <Link href="/client">Your projects</Link>
    <h1>Released findings</h1>
    {items.length ? <ul>{items.map(finding =>
      <li key={finding.id}><Link href={`/client/findings/${finding.id}`}>{finding.summary}</Link></li>
    )}</ul> : <p>No findings released yet.</p>}
  </Shell>;
}
