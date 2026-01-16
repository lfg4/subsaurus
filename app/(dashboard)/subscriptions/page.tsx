'use client';

import { useState } from 'react';
import { SubscriptionsList } from '@/app/components/subscriptions/SubscriptionsList';
import { useAuth } from '@/app/providers/AuthProvider';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SubscriptionsList 
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      workspaceId={user!.slackWorkspaceId}
      currentUser={user!}
    />
  );
}

