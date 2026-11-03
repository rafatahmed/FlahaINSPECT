import { redirect } from 'next/navigation';
import { pageAccount } from '@/lib/page-account';
import { home } from '@/lib/workspace';

export default async function HomePage() {
  const account = await pageAccount();
  redirect(home[account.role]);
}
