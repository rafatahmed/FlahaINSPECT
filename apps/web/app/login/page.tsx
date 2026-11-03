import { LoginForm } from '@/components/login-form';
import { safeNextPath } from '@/lib/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginForm next={safeNextPath(next)} />;
}