'use client';

import { use, useEffect } from 'react';
import { SubscriptionEdit } from '@/app/components/subscriptions/SubscriptionEdit';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function EditSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
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
    <SubscriptionEdit
      subscriptionId={subscriptionId}
      setCurrentPage={(page) => {
        if (page === 'subscriptions') {
          router.push('/subscriptions');
        }
      }}
      currentUser={user!}
    />
  );
}

