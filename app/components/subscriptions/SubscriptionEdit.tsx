'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus, X, Loader2 } from 'lucide-react';
import type { Subscription, User, PageType } from '@/app/types';
import { subscriptionsApi, usersApi, type UpdateSubscriptionDTO } from '@/app/lib/api';
import { RenewalCycle } from '@/src/types/enums';
import { AddUsersModal } from '@/app/components/subscriptions/AddUsersModal';
import { toast } from 'sonner';
import { CurrencySelect } from '@/app/components/shared/CurrencySelect';

interface SubscriptionEditProps {
  subscriptionId: number;
  setCurrentPage: (page: PageType) => void;
  currentUser: User;
}

export function SubscriptionEdit({ subscriptionId, setCurrentPage, currentUser }: SubscriptionEditProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    renewalCycle: RenewalCycle.MONTHLY,
    renewalDate: '',
    costAmount: 0,
    costCurrency: 'EUR',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [slackUsers, setSlackUsers] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      subscriptionsApi.getById(subscriptionId),
      usersApi.getAll(currentUser.slackWorkspaceId)
    ])
      .then(([data, usersData]) => {
        setSubscription(data);
        setFormData({
          name: data.name,
          project: data.projects?.[0] || '',
          renewalCycle: data.renewalCycle,
          renewalDate: data.renewalDate ? new Date(data.renewalDate).toISOString().split('T')[0] : '',
          costAmount: data.costAmount,
          costCurrency: data.costCurrency,
          notes: data.notes || ''
        });
        setSlackUsers(Array.isArray(usersData) ? usersData : []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [subscriptionId, currentUser.slackWorkspaceId]);

const getUserInfo = (slackUserId: string) => {
  return slackUsers.find(u => u.slackUserId === slackUserId);
};

const handleSave = async () => {
  setIsSaving(true);
  try {
    await subscriptionsApi.update(subscriptionId, formData);

    toast.success('Changes saved successfully');
      setCurrentPage('subscriptions');
    } catch {
      toast.error('Error saving changes');
    } finally {
      setIsSaving(false);
    }
};

const handleAddUsers = async (newUserIds: string[]) => {
  const updatedUserIds = [
    ...(subscription?.slackUserIds || []),
    ...newUserIds.filter(id => !subscription?.slackUserIds?.includes(id))
  ];

  const updateData: UpdateSubscriptionDTO = {
    slackUserIds: updatedUserIds
  };

  await subscriptionsApi.update(subscriptionId, updateData);

  const updatedSubscription = await subscriptionsApi.getById(subscriptionId);
  setSubscription(updatedSubscription);
  toast.success('Users added successfully');
};

const handleRemoveUser = async (userId: string) => {
  const updatedUserIds = subscription?.slackUserIds?.filter(id => id !== userId) || [];

  setRemovingUserId(userId);
  try {
    const updateData: UpdateSubscriptionDTO = {
      slackUserIds: updatedUserIds
    };

    await subscriptionsApi.update(subscriptionId, updateData);

    const updatedSubscription = await subscriptionsApi.getById(subscriptionId);
    setSubscription(updatedSubscription);
    toast.success('User removed successfully');
  } catch {
    toast.error('Error removing user');
  } finally {
    setRemovingUserId(null);
  }
};

const getAvailableUsers = () => {
  return slackUsers.filter(u => !subscription?.slackUserIds?.includes(u.slackUserId));
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
            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">Name</label>
            <input
              id={`name-${subscription.id}`}
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor={`project-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">Project</label>
            <input 
              id={`project-${subscription.id}`}
              type="text" 
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor={`renewalCycle-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">Renewal cycle</label>
            <select 
              id={`renewalCycle-${subscription.id}`}
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
            <label htmlFor={`renewalDate-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">Renewal date</label>
            <input 
              id={`renewalDate-${subscription.id}`}
              type="date" 
              value={formData.renewalDate}
              onChange={(e) => setFormData({...formData, renewalDate: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label htmlFor={`costAmount-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">Cost</label>
            <input 
              id={`costAmount-${subscription.id}`}
              type="number" 
              value={formData.costAmount}
              onChange={(e) => setFormData({...formData, costAmount: parseFloat(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
         <div>
  <label htmlFor={`costCurrency-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
  <CurrencySelect
    value={formData.costCurrency}
    onChange={(currency) => setFormData({...formData, costCurrency: currency})}
  />
</div>
        </div>
        <div className="mt-6">
          <label htmlFor={`notes-${subscription.id}`} className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
          <textarea
            id={`notes-${subscription.id}`}
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add any additional notes about this subscription..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold resize-none"
          />
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
         <button 
           type="button" 
            onClick={() => setShowAddUserModal(true)}
            className="text-green-600 hover:text-green-700 font-bold flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300 hover:bg-green-100 transition"
            >
             <Plus className="w-5 h-5" />
              Add user
            </button>
        </div>
        <div className="space-y-2">
          {subscription.slackUserIds?.length && subscription.slackUserIds?.length > 0 ? (
            subscription.slackUserIds.map((userId) => {
              const user = getUserInfo(userId);
              if (!user) return null;
              
              return (
                <div key={userId} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.displayName || user.email}
                        className="w-10 h-10 rounded-full shadow-lg"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                        {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-900">{user.displayName || user.email}</div>
                      <div className="text-sm text-gray-600 font-semibold">{user.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(userId)}
                    disabled={removingUserId === userId}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove user"
                  >
                    {removingUserId === userId ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 font-semibold">
              No assigned users yet
            </div>
          )}
          </div>
        </div>

      <AddUsersModal
  isOpen={showAddUserModal}
  onClose={() => setShowAddUserModal(false)}
  availableUsers={getAvailableUsers()}
  onAddUsers={handleAddUsers}
/>
    </div>
  );
}