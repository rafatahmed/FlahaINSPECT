import { Shell } from '@/components/shell';
import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { pageUpstream } from '@/lib/upstream';

export default async function ClientPage() {
  const account = await pageAccount('/client');
  const { status, json } = await pageUpstream('GET', '/client/projects');
  if (status !== 404) checkPageResponse(status);
  const projects = (json as { items?: Array<{ id: string; name: string }> } | null)?.items;
  return (
    <Shell account={account}>
      <h1>Client workspace</h1>
      <h2>Your projects</h2>
      {status === 404 || !projects ? <p>Client project information is unavailable.</p>
        : projects.length === 0 ? <p>No projects assigned.</p>
        : <ul>{projects.map(project => <li key={project.id}>{project.name}</li>)}</ul>}
    </Shell>
  );
}
