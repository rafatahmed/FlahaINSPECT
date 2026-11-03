import { ReportsClient } from '@/components/reports-client';
import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { Shell } from '@/components/shell';
import { pageUpstream } from '@/lib/upstream';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const account = await pageAccount('/reports');
  const { json: projectsJson, status } = await pageUpstream('GET', `/projects?archived=false`);
  checkPageResponse(status);
  const projects = ((projectsJson as { items?: Array<{ id: string; name: string }> } | null)?.items ??
    []) as Array<{ id: string; name: string }>;
  return (
    <Shell account={account}>
      <h1>Reports</h1>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ReportsClient projects={projects} initialProjectId={project} />
      )}
    </Shell>
  );
}
