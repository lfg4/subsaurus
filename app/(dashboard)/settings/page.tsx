'use client';

import { SettingsPage } from '@/app/components/settings/SettingsPage';
import { useAuth } from '@/app/providers/AuthProvider';

export default function Settings() {
  const { user } = useAuth();

  return <SettingsPage currentUser={user!} />;
}

