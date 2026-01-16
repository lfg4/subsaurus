'use client';

import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { usePathname } from 'next/navigation';
import type { PageType } from '@/app/types';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getCurrentPage = (): PageType => {
    if (pathname === '/') return 'dashboard';
    if (pathname.startsWith('/subscriptions')) {
      if (pathname.includes('/edit')) return 'subscription-edit';
      if (pathname.match(/\/subscriptions\/\d+$/)) return 'subscription-view';
      if (pathname.includes('/new')) return 'subscription-edit';
      return 'subscriptions';
    }
    if (pathname.startsWith('/checks')) {
      if (pathname.match(/\/checks\/\d+$/)) return 'check-detail';
      return 'checks';
    }
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/import')) return 'import';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Sidebar currentPage={getCurrentPage()} />
      
      <div className="pl-64">
        <Header currentUser={user} onLogout={logout} />
        
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  );
}

