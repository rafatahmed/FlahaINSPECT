import { Shell } from '@/components/shell';
import { upstream } from '@/lib/upstream';

export default async function UsersPage() {
  const [{ json: meJson }, { json }] = await Promise.all([
    upstream('GET', '/auth/me'),
    upstream('GET', '/users'),
  ]);
  const items = ((json as { items?: Array<{ id: string; email: string; full_name: string; role: string }> } | null)
    ?.items ?? []) as Array<{ id: string; email: string; full_name: string; role: string }>;
  const email = (meJson as { user?: { email?: string } } | null)?.user?.email;
  return (
    <Shell email={email}>
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Shell>
  );
}