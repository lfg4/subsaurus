'use client';

import { DashboardPage } from '@/app/components/analytics/DashboardPage';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <DashboardPage 
      currentUser={user!}
      setCurrentPage={(page) => {
        const routes: Record<string, string> = {
          subscriptions: '/subscriptions',
          'subscription-view': '/subscriptions',
          'subscription-edit': '/subscriptions',
          checks: '/checks',
          'check-detail': '/checks',
          settings: '/settings',
          import: '/import',
          dashboard: '/'
        };
        router.push(routes[page] || '/');
      }}
      setSelectedSubscriptionId={(id) => router.push(`/subscriptions/${id}`)}
    />
  );
}

