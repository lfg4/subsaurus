'use client';

import { useId } from 'react';
import type { User } from '@/app/types';

interface SettingsPageProps {
  currentUser: User | null;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const checkTimingId = useId();
  
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
            <select id={checkTimingId} className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
              <option value="5">5 days before</option>
              <option value="7">7 days before</option>
              <option value="14">14 days before</option>
              <option value="30">30 days before</option>
            </select>
          </div>
          <div className="pt-4">
            <button type="button" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}