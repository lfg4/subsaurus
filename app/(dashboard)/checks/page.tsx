'use client';

import { UsageChecks } from '@/app/components/checks/UsageChecks';
import { useAuth } from '@/app/providers/AuthProvider';

export default function ChecksPage() {
  const { user } = useAuth();

  return (
    <UsageChecks 
      workspaceId={user!.slackWorkspaceId}
    />
  );
}

