'use client';

import { NewSubscription } from '@/app/components/subscriptions/NewSubscription';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function NewSubscriptionPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <NewSubscription 
      setCurrentPage={(page) => {
        if (page === 'subscriptions') {
          router.push('/subscriptions');
        }
      }}
      currentUser={user!}
    />
  );
}

