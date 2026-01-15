'use client';

import { useId, useState, useEffect } from 'react';
import type { User } from '@/app/types';
import { settingsApi } from '@/app/lib/api';
import { toast } from 'sonner';

interface SettingsPageProps {
  currentUser: User | null;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const checkTimingId = useId();
  const [daysBeforeRenewal, setDaysBeforeRenewal] = useState<number>(7);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (currentUser?.slackWorkspaceId) {
      settingsApi.get(currentUser.slackWorkspaceId)
        .then(settings => {
          setDaysBeforeRenewal(settings.daysBeforeRenewal);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error loading settings:', err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser?.slackWorkspaceId) {
      toast.error('Workspace ID not found');
      return;
    }

    setIsSaving(true);
    try {
      await settingsApi.update(currentUser.slackWorkspaceId, daysBeforeRenewal);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
            {currentUser?.displayName?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900">{currentUser?.displayName}</div>
            <div className="text-gray-600">{currentUser?.email}</div>
            <div className="text-sm text-gray-500 mt-1">Slack User ID: {currentUser?.slackUserId}</div>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workspace</h2>
        <div className="text-gray-600">
          <div className="mb-2">Workspace ID: <span className="font-mono text-sm">{currentUser?.slackWorkspaceId}</span></div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Check Settings</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor={checkTimingId} className="block text-sm font-medium text-gray-700 mb-2">
              Send check before renewal
            </label>
            <select 
              id={checkTimingId} 
              value={daysBeforeRenewal}
              onChange={(e) => setDaysBeforeRenewal(Number(e.target.value))}
              disabled={isLoading}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="5">5 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
              <option value="30">30 days before</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">
              This applies to new subscriptions. Reminder is always sent 3 days before the end.
            </p>
          </div>
          <div className="pt-4">
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}