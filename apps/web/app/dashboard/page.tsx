import { DashboardClient } from '@/components/dashboard-client';
import { Shell } from '@/components/shell';
import { upstream } from '@/lib/upstream';

export default async function DashboardPage({
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
    []) as Array<{ id: string; name: string; is_archived?: boolean }>;
  const email = (meJson as { user?: { email?: string } } | null)?.user?.email;
  return (
    <Shell email={email}>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <DashboardClient projects={projects} initialProjectId={project} />
      )}
    </Shell>
  );
}