'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus } from 'lucide-react';
import { subscriptionsApi, usersApi, type SlackUserDTO } from '@/app/lib/api';
import { RenewalCycle } from '@/src/types/enums';
import { AddUsersModal } from '@/app/components/subscriptions/AddUsersModal';
import { toast } from 'sonner';
import type { User, PageType } from '@/app/types';

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
    costCurrency: 'EUR',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [slackUsers, setSlackUsers] = useState<SlackUserDTO[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  useEffect(() => {
    usersApi.getAll(currentUser.slackWorkspaceId)
      .then((data: SlackUserDTO[]) => setSlackUsers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [currentUser.slackWorkspaceId]);
  
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
      // Parse projects from comma-separated string
      const projectsArray = formData.project
        ? formData.project.split(',').map(p => p.trim()).filter(p => p.length > 0)
        : [];

      const { project, ...restFormData } = formData;

      await subscriptionsApi.create({
        ...restFormData,
        projects: projectsArray,
        slackUserIds: selectedUserIds.length > 0 ? selectedUserIds : [],
        slackWorkspaceId: currentUser.slackWorkspaceId,
        createdBySlackUserId: currentUser.slackUserId
      });

      toast.success('Subscription created successfully!');
      setCurrentPage('subscriptions');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Error creating subscription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddUsers = async (userIds: string[]) => {
    setSelectedUserIds([...selectedUserIds, ...userIds.filter(id => !selectedUserIds.includes(id))]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
  };

  const getAvailableUsers = () => {
    return slackUsers
      .filter(u => !selectedUserIds.includes(u.slackUserId))
      .map(u => ({
        slackUserId: u.slackUserId,
        displayName: u.displayName,
        email: u.email || '',
        avatarUrl: u.avatarUrl
      }));
  };

  const getUserInfo = (userId: string) => {
    return slackUsers.find(u => u.slackUserId === userId);
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
            <label htmlFor="project" className="block text-sm font-bold text-gray-700 mb-2">Projects</label>
            <input 
              type="text" 
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              placeholder="e.g. Design Team, Marketing, Sales"
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
            <p className="text-xs text-gray-500 mt-1">💡 Separate multiple projects with commas</p>
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

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-2">📝 Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add any additional notes about this subscription..."
            rows={4}
            className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold resize-none"
          />
        </div>

        <div className="mt-6 pt-6 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>👥</span>
              Assigned users ({selectedUserIds.length})
            </h3>
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
            {selectedUserIds.length > 0 ? (
              selectedUserIds.map(userId => {
                const user = getUserInfo(userId);
                if (!user) return null;
                
                return (
                  <div key={userId} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName || user.email || 'User'}
                          className="w-10 h-10 rounded-full shadow-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-gray-900">{user.displayName || user.email || 'Unknown'}</div>
                        <div className="text-sm text-gray-600 font-semibold">{user.email || ''}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(userId)}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 font-semibold">
                No users assigned yet. Click "Add user" to assign users.
              </div>
            )}
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

      <AddUsersModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        availableUsers={getAvailableUsers()}
        onAddUsers={handleAddUsers}
      />
    </div>
  );
}