'use client';

import { useId, useState, useEffect, useRef } from 'react';
import type { User } from '@/app/types';
import { settingsApi } from '@/app/lib/api';
import { toast } from 'sonner';
import { getPopularCurrencies, getAllCurrencies, getCurrencySymbol } from '@/app/utils/currency';

interface SettingsPageProps {
  currentUser: User | null;
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const checkTimingId = useId();
  const currencyId = useId();
  const [daysBeforeRenewal, setDaysBeforeRenewal] = useState<number>(7);
  const [preferredCurrency, setPreferredCurrency] = useState<string>('EUR');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentUser?.slackWorkspaceId) {
      settingsApi.get(currentUser.slackWorkspaceId)
        .then(settings => {
          setDaysBeforeRenewal(settings.daysBeforeRenewal);
          setPreferredCurrency(settings.preferredCurrency || 'EUR');
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
      setIsCurrencyDropdownOpen(false);
    }
  };

  if (isCurrencyDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isCurrencyDropdownOpen]);

console.log('🦖 Current state:', {
  daysBeforeRenewal,
  type: typeof daysBeforeRenewal,
  preferredCurrency
});

  const handleSave = async () => {
  console.log('🦖 DEBUG handleSave:', {
    hasCurrentUser: !!currentUser,
    workspaceId: currentUser?.slackWorkspaceId,
    daysBeforeRenewal,
    preferredCurrency
  });

  if (!currentUser?.slackWorkspaceId) {
    toast.error('Workspace ID not found');
    return;
  }

  setIsSaving(true);
  try {
    console.log('🦖 Calling settingsApi.update with:', {
      workspaceId: currentUser.slackWorkspaceId,
      daysBeforeRenewal,
      preferredCurrency
    });
    
    await settingsApi.update(currentUser.slackWorkspaceId, daysBeforeRenewal, preferredCurrency);
    toast.success('Settings saved successfully');
  } catch (error) {
    console.error('🦖 Error saving:', error);
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferences</h2>
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
<div>
  <label htmlFor={currencyId} className="block text-sm font-medium text-gray-700 mb-2">
    Preferred currency for dashboard
  </label>
  
  <div className="relative" ref={currencyDropdownRef}>
    <button
      type="button"
      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
      disabled={isLoading}
      className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 text-left flex items-center justify-between bg-white"
    >
      <span>{getCurrencySymbol(preferredCurrency)} {preferredCurrency}</span>
      <span className="text-indigo-600">{isCurrencyDropdownOpen ? '▲' : '▼'}</span>
    </button>
    
    {isCurrencyDropdownOpen && (
      <div className="absolute z-50 mt-1 w-full max-w-xs bg-white border-2 border-indigo-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
        <div className="px-3 py-2 bg-indigo-50 font-bold text-sm text-gray-700 sticky top-0 border-b-2 border-indigo-200">
          Popular Currencies
        </div>
        {getPopularCurrencies().map(code => (
          <button
            key={code}
            type="button"
            onClick={() => {
              setPreferredCurrency(code);
              setIsCurrencyDropdownOpen(false);
            }}
            className={`w-full text-left px-3 py-2 hover:bg-indigo-50 transition ${
              preferredCurrency === code ? 'bg-indigo-100 font-bold text-indigo-900' : ''
            }`}
          >
            {getCurrencySymbol(code)} {code}
          </button>
        ))}
        
        <div className="px-3 py-2 bg-indigo-50 font-bold text-sm text-gray-700 sticky top-0 border-b-2 border-indigo-200">
          All Currencies (A-Z)
        </div>
        {getAllCurrencies().map(currency => (
          <button
            key={currency.code}
            type="button"
            onClick={() => {
              setPreferredCurrency(currency.code);
              setIsCurrencyDropdownOpen(false);
            }}
            className={`w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm transition ${
              preferredCurrency === currency.code ? 'bg-indigo-100 font-bold text-indigo-900' : ''
            }`}
          >
            {getCurrencySymbol(currency.code)} {currency.code} - {currency.name}
          </button>
        ))}
      </div>
    )}
  </div>
  
  <p className="text-sm text-gray-500 mt-2">
    Dashboard amounts will be converted to this currency. Subscriptions can still be created in any currency.
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