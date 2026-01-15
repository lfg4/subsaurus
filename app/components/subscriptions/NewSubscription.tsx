'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { subscriptionsApi } from '@/app/lib/api';
import { RenewalCycle } from '@/src/types/enums';
import { toast } from 'sonner';
import type { User } from '@/app/types';

type PageType = 'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings';

interface NewSubscriptionProps {
  setCurrentPage: (page: PageType) => void;
  currentUser: User;
}

export function NewSubscription({ setCurrentPage, currentUser }: NewSubscriptionProps) {
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    renewalCycle: RenewalCycle.MONTHLY,
    renewalDate: '',
    costAmount: 0,
    costCurrency: 'EUR'
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.warning('Name is required');
      return;
    }
    if (!formData.renewalDate) {
      toast.warning('Renewal date is required');
      return;
    }

    setIsSaving(true);
    try {
      await subscriptionsApi.create({
        ...formData,
        slackWorkspaceId: currentUser.slackWorkspaceId,
        createdBySlackUserId: currentUser.slackUserId,
        slackUserIds: [currentUser.slackUserId]
      });

      toast.success('Subscription created successfully!');
      setCurrentPage('subscriptions');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error creating subscription');
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1 className="text-4xl font-black text-gray-900">New subscription</h1>
        <span className="text-3xl">🦖🍖</span>
      </div>

      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Subscription information
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Figma Professional"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor="project" className="block text-sm font-bold text-gray-700 mb-2">Project</label>
            <input 
              type="text" 
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              placeholder="e.g. Design Team"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor="renewalCycle" className="block text-sm font-bold text-gray-700 mb-2">Renewal cycle</label>
            <select 
              value={formData.renewalCycle}
              onChange={(e) => setFormData({...formData, renewalCycle: e.target.value as RenewalCycle})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value={RenewalCycle.MONTHLY}>🔄 Monthly</option>
              <option value={RenewalCycle.YEARLY}>📅 Yearly</option>
              <option value={RenewalCycle.CUSTOM}>⚙️ Custom</option>
            </select>
          </div>
          <div>
            <label htmlFor="renewalDate" className="block text-sm font-bold text-gray-700 mb-2">Renewal date *</label>
            <input 
              type="date" 
              value={formData.renewalDate}
              onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor="costAmount" className="block text-sm font-bold text-gray-700 mb-2">Cost</label>
            <input 
              type="number" 
              value={formData.costAmount}
              onChange={(e) => setFormData({...formData, costAmount: parseFloat(e.target.value)})}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor="costCurrency" className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
            <select 
              value={formData.costCurrency}
              onChange={(e) => setFormData({...formData, costCurrency: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value="EUR">€ EUR</option>
            <option value="USD">$ USD</option>
            <option value="GBP">£ GBP</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button 
            type="button"
            onClick={handleCreate}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Creating...' : '🦖 Create subscription'}
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
    </div>
  );
}