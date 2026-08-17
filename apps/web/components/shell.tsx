'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';

export function Shell({ children, email }: { children: ReactNode; email?: string }) {
  const path = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch('/bff/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }
  return (
    <div className="shell">
      <nav className="nav">
        <BrandMark variant="white" height={56} />
        <Link className={path.startsWith('/dashboard') ? 'active' : ''} href="/dashboard">
          Dashboard
        </Link>
        <Link className={path.startsWith('/projects') ? 'active' : ''} href="/projects">
          Projects
        </Link>
        <Link className={path.startsWith('/users') ? 'active' : ''} href="/users">
          Users
        </Link>
        <Link className={path.startsWith('/reports') ? 'active' : ''} href="/reports">
          Reports
        </Link>
      </nav>
      <div className="main">
        <div className="header">
          <span className="muted">{email}</span>
          <button type="button" onClick={() => void logout()}>
            Log out
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
