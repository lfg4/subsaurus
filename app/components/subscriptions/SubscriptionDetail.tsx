'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import type { Subscription } from '@/app/types';
import { formatDate } from '@/app/utils/formatDate';

type PageType = 'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings';

const mockUsageChecks = [
  {
    id: 1,
    subscriptionId: 1,
    subscriptionName: 'Figma Professional',
    periodStart: '2025-12-20',
    periodEnd: '2026-01-20',
    sendAt: '2026-01-15T10:00:00Z',
    status: 'SENT',
    responsesCount: 5
  },
  {
    id: 2,
    subscriptionId: 2,
    subscriptionName: 'GitHub Teams',
    periodStart: '2025-12-15',
    periodEnd: '2026-01-15',
    sendAt: '2026-01-10T10:00:00Z',
    status: 'SENT',
    responsesCount: 10
  }
];

interface SubscriptionDetailProps {
  subscriptionId: number;
  setCurrentPage: (page: PageType) => void;
}

export function SubscriptionDetail({ subscriptionId, setCurrentPage }: SubscriptionDetailProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    renewalCycle: 'MONTHLY' as 'MONTHLY' | 'YEARLY' | 'CUSTOM',
    renewalDate: '',
    costAmount: 0,
    costCurrency: 'EUR'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/subscriptions/${subscriptionId}`)
      .then(res => res.json())
      .then(data => {
        setSubscription(data);
        setFormData({
          name: data.name,
          project: data.projects?.[0] || '',
          renewalCycle: data.renewalCycle,
          renewalDate: data.renewalDate ? new Date(data.renewalDate).toISOString().split('T')[0] : '',
          costAmount: data.costAmount,
          costCurrency: data.costCurrency
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setIsLoading(false);
      });
  }, [subscriptionId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error saving');

      alert('✅ Changes saved successfully');
      setCurrentPage('subscriptions');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading subscription...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🦖❓</div>
        <div className="text-xl font-bold text-gray-700">Subscription not found</div>
        <button 
          type="button"
          onClick={() => setCurrentPage('subscriptions')}
          className="mt-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300"
        >
          ← Back to subscriptions
        </button>
      </div>
    );
  }

  return (
    <div>
      <button 
        type="button"
        onClick={() => setCurrentPage('subscriptions')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to subscriptions
      </button>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-black text-gray-900">{subscription.name}</h1>
        <span className="text-3xl">✏️</span>
      </div>

      {}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          General information
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Project</label>
            <input 
              type="text" 
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Renewal cycle</label>
            <select 
              value={formData.renewalCycle}
              onChange={(e) => setFormData({...formData, renewalCycle: e.target.value as 'MONTHLY' | 'YEARLY' | 'CUSTOM'})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value="MONTHLY">🔄 Monthly</option>
              <option value="YEARLY">📅 Yearly</option>
              <option value="CUSTOM">⚙️ Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Renewal date</label>
            <input 
              type="date" 
              value={formData.renewalDate}
              onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Cost</label>
            <input 
              type="number" 
              value={formData.costAmount}
              onChange={(e) => setFormData({...formData, costAmount: parseFloat(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
            <select 
              value={formData.costCurrency}
              onChange={(e) => setFormData({...formData, costCurrency: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value="EUR">💶 EUR</option>
              <option value="USD">💵 USD</option>
              <option value="GBP">💷 GBP</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Saving...' : '💾 Save changes'}
          </button>
          <button 
            type="button"
            onClick={() => setCurrentPage('subscriptions')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-bold"
          >
            Cancel
          </button>
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Assigned users ({subscription.slackUserIds?.length || 0})
          </h2>
          <button type="button" className="text-green-600 hover:text-green-700 font-bold flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300 hover:bg-green-100 transition">
            <Plus className="w-5 h-5" />
            Add user
          </button>
        </div>
        <div className="space-y-2">
          {subscription.slackUserIds?.length && subscription.slackUserIds?.length > 0 ? (
            Array.from({ length: subscription.slackUserIds?.length }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                    U{i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">User {i + 1}</div>
                    <div className="text-sm text-gray-600 font-semibold">user{i + 1}@company.com</div>
                  </div>
                </div>
                {false && (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-black rounded-lg border-2 ${
                      i % 3 === 0 ? 'bg-green-100 text-green-700 border-green-300' :
                      i % 3 === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {i % 3 === 0 ? '✅ Uses it' : i % 3 === 1 ? '⚠️ Little' : '❌ No response'}
                    </span>
                    <button type="button" className="p-2 text-gray-400 hover:text-red-600 transform hover:scale-125 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 font-semibold">
              No assigned users yet
            </div>
          )}
        </div>
      </div>

      {}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Usage checks history
        </h2>
        <div className="space-y-3">
          {mockUsageChecks.filter(c => c.subscriptionId === subscriptionId).map(check => (
            <div key={check.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div>
                <div className="font-bold text-gray-900">
                  {formatDate(check.periodStart)} - {formatDate(check.periodEnd)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  Sent: {formatDate(check.sendAt)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-black rounded-full border-2 ${
                  check.status === 'SENT' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  check.status === 'CLOSED' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                  'bg-yellow-100 text-yellow-700 border-yellow-300'
                }`}>
                  {check.status}
                </span>
                <span className="text-sm text-gray-600 font-bold">{check.responsesCount} responses</span>
                <button type="button" className="text-green-600 hover:text-green-700 transform hover:scale-125 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {mockUsageChecks.filter(c => c.subscriptionId === subscriptionId).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">🦖</div>
              <div className="text-gray-500 font-semibold">No usage checks for this subscription</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}