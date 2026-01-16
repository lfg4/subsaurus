'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Calendar, DollarSign, Users, ArrowLeft, Folder, ChevronRight, Send } from 'lucide-react';
import type { Subscription, User, PageType } from '@/app/types';
import { subscriptionsApi, usersApi, usageChecksApi, type SlackUserDTO } from '@/app/lib/api';
import { getCurrencySymbol } from '@/app/utils/currency';
import { formatDate } from '@/app/utils/formatDate';
import { UsageCheckStatus } from '@/src/types/enums';
import { toast } from 'sonner';

interface SubscriptionViewProps {
  subscriptionId: number;
  setCurrentPage: (page: PageType) => void;
  setSelectedSubscriptionId: (id: number) => void;
  setSelectedCheckId: (id: number) => void;
  currentUser: User;
}

export function SubscriptionView({ 
  subscriptionId, 
  setCurrentPage,
  setSelectedSubscriptionId,
  setSelectedCheckId,
  currentUser 
}: SubscriptionViewProps) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [assignedUsers, setAssignedUsers] = useState<SlackUserDTO[]>([]);
  const [usageChecks, setUsageChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRequestingUsers, setIsRequestingUsers] = useState(false);

  useEffect(() => {
    Promise.all([
      subscriptionsApi.getById(subscriptionId),
      usersApi.getAll(currentUser.slackWorkspaceId),
      usageChecksApi.getAll(subscriptionId)
    ])
      .then(([subData, usersData, checksData]) => {
        setSubscription(subData);
        
        // Filtrar los usuarios asignados
        const assigned = usersData.filter(user => 
          subData.slackUserIds?.includes(user.slackUserId)
        );
        setAssignedUsers(assigned);
        setUsageChecks(Array.isArray(checksData) ? checksData : []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [subscriptionId, currentUser.slackWorkspaceId]);

  const handleDelete = async () => {
    if (!confirm('🦖 Are you sure you want to delete this subscription? The dino will devour it forever!')) {
      return;
    }

    setIsDeleting(true);
    try {
      await subscriptionsApi.delete(subscriptionId);
      router.push('/subscriptions');
    } catch (error) {
      alert('Failed to delete subscription');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/subscriptions/${subscriptionId}/edit`);
  };

  const handleViewCheck = (checkId: number) => {
    router.push(`/checks/${checkId}`);
  };

  const handleRequestUsers = async () => {
    setIsRequestingUsers(true);
    try {
      const result = await subscriptionsApi.requestUsers(subscriptionId);
      toast.success(`✅ Message sent to ${result.sentCount} users!`);
    } catch (error) {
      toast.error('❌ Failed to send messages');
    } finally {
      setIsRequestingUsers(false);
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
        <div className="text-8xl mb-4">😢</div>
        <div className="text-xl font-bold text-gray-700">Subscription not found</div>
      </div>
    );
  }

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      MONTHLY: 'Monthly',
      YEARLY: 'Yearly',
      CUSTOM: 'Custom',
    };
    return labels[cycle] || cycle;
  };

  const getDaysUntilRenewal = () => {
    const now = new Date();
    const renewal = new Date(subscription.renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntilRenewal();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/subscriptions')}
            className="p-3 hover:bg-white/50 rounded-xl transition-all border-2 border-green-300 bg-white"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-5xl font-black text-gray-900">{subscription.name}</h1>
            <p className="text-gray-600 font-semibold text-lg mt-1">Subscription Details</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-bold transition-all shadow-lg border-2 border-blue-300 transform hover:scale-105"
          >
            <Pencil className="w-5 h-5" />
            Edit
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold transition-all shadow-lg border-2 border-red-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Trash2 className="w-5 h-5" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Main Info Card - Full Width */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-4 border-green-400 p-8 shadow-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Amount */}
          <div className="bg-white rounded-xl p-6 border-2 border-green-300 shadow-md">
            <div className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              AMOUNT
            </div>
            <div className="text-4xl font-black text-gray-900">
              {getCurrencySymbol(subscription.costCurrency)}{subscription.costAmount}
            </div>
            <div className="text-sm text-gray-500 font-semibold mt-1">{subscription.costCurrency}</div>
          </div>

          {/* Billing Cycle */}
          <div className="bg-white rounded-xl p-6 border-2 border-blue-300 shadow-md">
            <div className="text-sm font-bold text-gray-600 mb-2">BILLING CYCLE</div>
            <div className="text-3xl font-black text-gray-900">
              {getBillingCycleLabel(subscription.renewalCycle)}
            </div>
          </div>

          {/* Renewal Date */}
          <div className={`bg-white rounded-xl p-6 border-2 shadow-md ${
            daysUntil <= 7 ? 'border-red-300' : daysUntil <= 30 ? 'border-yellow-300' : 'border-green-300'
          }`}>
            <div className="text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              RENEWAL DATE
            </div>
            <div className="text-2xl font-black text-gray-900">
              {new Date(subscription.renewalDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <div className={`text-sm font-bold mt-2 ${
              daysUntil <= 7 ? 'text-red-600' : daysUntil <= 30 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {daysUntil > 0 ? `In ${daysUntil} days` : daysUntil === 0 ? 'Today!' : `${Math.abs(daysUntil)} days overdue`}
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section - Full Width */}
      {subscription.projects && subscription.projects.length > 0 && (
        <div className="bg-white rounded-2xl border-4 border-purple-400 p-8 shadow-xl mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Folder className="w-6 h-6 text-purple-600" />
            Projects
          </h2>
          <div className="flex flex-wrap gap-3">
            {subscription.projects.map((project, idx) => (
              <div
                key={idx}
                className="px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl text-lg font-black text-purple-900 border-2 border-purple-300 shadow-md"
              >
                📁 {project}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Users Section - Full Width */}
      <div className="bg-white rounded-2xl border-4 border-blue-400 p-8 shadow-xl mb-6">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          Assigned Users ({assignedUsers.length})
        </h2>
        
        {assignedUsers.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {assignedUsers.map((user) => (
      <div
        key={user.slackUserId}
        className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-12 h-12 rounded-full border-2 border-blue-300 object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-black text-xl border-2 border-blue-300">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <div className="font-black text-gray-900">{user.displayName}</div>
          <div className="text-sm text-gray-600 font-semibold">{user.email}</div>
        </div>
      </div>
    ))}
  </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">👻</div>
            <p className="text-gray-600 font-semibold mb-4">No users assigned yet</p>
            <button
              type="button"
              onClick={handleRequestUsers}
              disabled={isRequestingUsers}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isRequestingUsers ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending messages...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Ask all users if they use it
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              💡 This will send a Slack message to all active users in the workspace
            </p>
          </div>
        )}
      </div>

      {/* Notes Section - Full Width */}
      {subscription.notes && (
        <div className="bg-white rounded-2xl border-4 border-yellow-400 p-8 shadow-xl mb-6">
          <h2 className="text-2xl font-black text-gray-900 mb-4">📝 Notes</h2>
          <div className="bg-yellow-50 rounded-xl p-6 border-2 border-yellow-300">
            <div className="text-gray-700 font-semibold whitespace-pre-wrap text-lg leading-relaxed">
              {subscription.notes}
            </div>
          </div>
        </div>
      )}

      {/* Usage Checks Section - Full Width */}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-8 shadow-xl">
        <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Usage checks history
        </h2>
        <div className="space-y-3">
          {usageChecks.map(check => (
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
                  check.status === UsageCheckStatus.SENT ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  check.status === UsageCheckStatus.CLOSED ? 'bg-gray-100 text-gray-600 border-gray-300' :
                  'bg-yellow-100 text-yellow-700 border-yellow-300'
                }`}>
                  {check.status}
                </span>
                <span className="text-sm text-gray-600 font-bold">{check.responsesCount} responses</span>
                <button 
                  type="button" 
                  onClick={() => handleViewCheck(check.id)}
                  className="text-green-600 hover:text-green-700 transform hover:scale-125 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {usageChecks.length === 0 && (
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