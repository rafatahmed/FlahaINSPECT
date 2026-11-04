import { Shell } from '@/components/shell';
import { pageAccount, checkPageResponse } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';
import { notFound } from 'next/navigation';
import { isUuid } from '@/lib/ids';
import { IssuedPdf } from '@/components/issued-pdf';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const account = await pageAccount('/client');
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { status, json } = await pageUpstream('GET', `/client/reports/${id}`);
  if (status === 404) notFound();
  checkPageResponse(status);
  const { report } = json as { report: { revision: number } };
  return (
    <Shell account={account}>
      <h1>Issued report · Revision {report.revision}</h1>
      <IssuedPdf id={id} />
    </Shell>
  );
}
