import { Shell } from '@/components/shell';
import { upstream } from '@/lib/upstream';

export default async function ProjectsPage() {
  const [{ json: meJson }, { json }] = await Promise.all([
    upstream('GET', '/auth/me'),
    upstream('GET', '/projects'),
  ]);
  const items = ((json as { items?: Array<{ id: string; name: string; is_archived?: boolean }> } | null)
    ?.items ?? []) as Array<{ id: string; name: string; is_archived?: boolean }>;
  const email = (meJson as { user?: { email?: string } } | null)?.user?.email;
  return (
    <Shell email={email}>
      <h1>Projects</h1>
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
                <a href={`/dashboard?project=${p.id}`}>{p.name}</a>
              </td>
              <td>{p.is_archived ? 'yes' : 'no'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}