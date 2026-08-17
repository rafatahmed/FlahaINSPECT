import { ReportsClient } from '@/components/reports-client';
import { Shell } from '@/components/shell';
import { upstream } from '@/lib/upstream';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const { project } = await searchParams;
  const [{ json: projectsJson }, { json: meJson }] = await Promise.all([
    upstream('GET', '/projects?archived=false'),
    upstream('GET', '/auth/me'),
  ]);
  const projects = ((projectsJson as { items?: Array<{ id: string; name: string }> } | null)?.items ??
    []) as Array<{ id: string; name: string }>;
  const email = (meJson as { user?: { email?: string } } | null)?.user?.email;
  return (
    <Shell email={email}>
      <h1>Reports</h1>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ReportsClient projects={projects} initialProjectId={project} />
      )}
    </Shell>
  );
}
