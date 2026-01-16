'use client';

import { use, useEffect } from 'react';
import { SubscriptionView } from '@/app/components/subscriptions/SubscriptionView';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ViewSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = use(params);
  
  const subscriptionId = parseInt(id);
  
  useEffect(() => {
    if (isNaN(subscriptionId)) {
      router.push('/subscriptions');
    }
  }, [subscriptionId, router]);
  
  if (isNaN(subscriptionId)) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🦖</div>
        <div className="text-xl font-bold text-gray-700">ID de suscripción inválido</div>
      </div>
    );
  }

  return (
    <SubscriptionView
      subscriptionId={subscriptionId}
      setCurrentPage={(page) => {
        const routes: Record<string, string> = {
          subscriptions: '/subscriptions',
          'subscription-edit': `/subscriptions/${id}/edit`,
          'check-detail': '/checks'
        };
        router.push(routes[page] || '/subscriptions');
      }}
      setSelectedSubscriptionId={(subId) => router.push(`/subscriptions/${subId}`)}
      setSelectedCheckId={(checkId) => router.push(`/checks/${checkId}`)}
      currentUser={user!}
    />
  );
}

