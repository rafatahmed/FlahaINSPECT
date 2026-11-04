import { notFound } from 'next/navigation';
import { Shell } from '@/components/shell';
import { pageAccount, checkPageResponse } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';
import { isUuid } from '@/lib/ids';
import { IssueReport } from '@/components/issue-report';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const account = await pageAccount('/reports');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { status, json } = await pageUpstream(
    'GET',
    `/projects/${id}/issuance-draft`,
  );
  if (status === 404) notFound();
  checkPageResponse(status);
  const draft = json as {
    project: { name: string };
    items: { id: string; summary: string }[];
  };
  return (
    <Shell account={account}>
      <h1>Issue client report</h1>
      <h2>{draft.project.name}</h2>
      <p>
        Review all released findings below. Issuing freezes their summaries and
        evidence in a new revision.
      </p>
      <IssueReport projectId={id} findings={draft.items} />
    </Shell>
  );
}
