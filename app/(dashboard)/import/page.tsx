'use client';

import { ImportWizard } from '@/app/components/import/ImportWizard';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-5xl">📤</span>
        <div>
          <h1 className="text-4xl font-black text-gray-900">Import subscriptions</h1>
          <p className="text-gray-600 font-semibold">Import your subscriptions from a CSV or Excel bank statement</p>
        </div>
      </div>
      <ImportWizard
        slackWorkspaceId={user!.slackWorkspaceId}
        createdBySlackUserId={user!.slackUserId}
        defaultSlackUserIds={[user!.slackUserId]}
        onComplete={() => router.push('/subscriptions')}
      />
    </div>
  );
}

