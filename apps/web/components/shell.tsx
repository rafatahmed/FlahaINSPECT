'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/brand-mark';

import { mayOpen, type Account } from '@/lib/workspace';

const navigation = [
  ['/dashboard', 'Dashboard'], ['/projects', 'Projects'], ['/users', 'Users'],
  ['/reports', 'Reports'], ['/client', 'Client workspace'],
] as const;

export function Shell({ children, account }: { children: ReactNode; account: Account }) {
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
        {navigation.filter(([href]) => mayOpen(account.role, href)).map(([href, label]) => (
          <Link key={href} className={path === href ? 'active' : ''} href={href}>
            {href === '/projects' && account.role === 'inspector' ? 'Assigned projects' : label}
          </Link>
        ))}
      </nav>
      <div className="main">
        <div className="header">
          <span className="muted">{account.email}</span>
          <button type="button" onClick={() => void logout()}>
            Log out
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
