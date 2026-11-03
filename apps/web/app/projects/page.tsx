import { DashboardClient } from '@/components/dashboard-client';
import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { Shell } from '@/components/shell';
import { pageUpstream } from '@/lib/upstream';

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const account = await pageAccount('/projects');
  const { json, status } = await pageUpstream('GET', `/projects`);
  checkPageResponse(status);
  const items = ((json as { items?: Array<{ id: string; name: string; is_archived?: boolean }> } | null)
    ?.items ?? []) as Array<{ id: string; name: string; is_archived?: boolean }>;
  const selected = (await searchParams).project;
  const inspector = account.role === 'inspector';
  return (
    <Shell account={account}>
      <h1>{inspector ? 'Assigned projects' : 'Projects'}</h1>
      {items.length === 0 && <p>No projects assigned.</p>}
      {inspector && selected && (items.some(p => p.id === selected)
        ? <DashboardClient key={selected} projects={items} initialProjectId={selected} projectPath="/projects" />
        : <p>This project is unavailable.</p>)}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Archived</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id}>
              <td>
                <a href={`${inspector ? '/projects' : '/dashboard'}?project=${p.id}`}>{p.name}</a>
              </td>
              <td>{p.is_archived ? 'yes' : 'no'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}