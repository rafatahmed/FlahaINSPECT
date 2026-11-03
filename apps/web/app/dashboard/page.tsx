import { DashboardClient } from '@/components/dashboard-client';
import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { Shell } from '@/components/shell';
import { pageUpstream } from '@/lib/upstream';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const account = await pageAccount('/dashboard');
  const { json: projectsJson, status } = await pageUpstream('GET', `/projects?archived=false`);
  checkPageResponse(status);
  const projects = ((projectsJson as { items?: Array<{ id: string; name: string }> } | null)?.items ??
    []) as Array<{ id: string; name: string; is_archived?: boolean }>;
  return (
    <Shell account={account}>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <DashboardClient projects={projects} initialProjectId={project} />
      )}
    </Shell>
  );
}