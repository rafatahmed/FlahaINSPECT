import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/session';

export default async function HomePage() {
  const jar = await cookies();
  if (jar.get(ACCESS_COOKIE)?.value || jar.get(REFRESH_COOKIE)?.value) {
    redirect('/dashboard');
  }
  redirect('/login');
}
