import { checkPageResponse, pageAccount } from '@/lib/page-account';
import { Shell } from '@/components/shell';
import { pageUpstream } from '@/lib/upstream';

export default async function UsersPage() {
  const account = await pageAccount('/users');
  const { json, status } = await pageUpstream('GET', `/users`);
  checkPageResponse(status);
  const items = ((json as { items?: Array<{ id: string; email: string; full_name: string; role: string }> } | null)
    ?.items ?? []) as Array<{ id: string; email: string; full_name: string; role: string }>;
  return (
    <Shell account={account}>
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