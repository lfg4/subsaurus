'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Subscription, User, PageType } from '@/app/types';
import { formatDate } from '@/app/utils/formatDate';
import { Modal } from '@/app/components/shared/Modal';
import { NewSubscription } from './NewSubscription';
import { subscriptionsApi, usageChecksApi } from '@/app/lib/api';
import { toast } from 'sonner';

interface SubscriptionsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage?: (page: PageType) => void;
  setSelectedSubscriptionId?: (id: number) => void;
  workspaceId: string;
  currentUser: User;
}

export function SubscriptionsList({ 
  searchTerm, 
  setSearchTerm, 
  setCurrentPage, 
  setSelectedSubscriptionId,
  workspaceId,
  currentUser
}: SubscriptionsListProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'name' | 'renewalDate' | 'costAmount' | 'project'>('renewalDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [usageChecks, setUsageChecks] = useState<any[]>([]);

useEffect(() => {
  Promise.all([
    subscriptionsApi.getAll(workspaceId),
    usageChecksApi.getAll(undefined, workspaceId)
  ])
    .then(([subscriptionsData, checksData]) => {
      setSubscriptions(subscriptionsData);
      setUsageChecks(Array.isArray(checksData) ? checksData : []);
      setIsLoading(false);
    })
    .catch(() => {
      setIsLoading(false);
    });
}, [workspaceId]);

  const getLastCheck = (subscriptionId: number) => {
    const subChecks = usageChecks
      .filter(check => check.subscriptionId === subscriptionId)
      .sort((a, b) => new Date(b.sendAt).getTime() - new Date(a.sendAt).getTime());
  
    return subChecks[0] || null;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading subscription....</div>
      </div>
    );
  }

  if (showNewSubscription) {
  return <NewSubscription 
    currentUser={currentUser}
    setCurrentPage={() => { 
      setShowNewSubscription(false); 
      if (setCurrentPage) {
        setCurrentPage('subscriptions');
      } else {
        router.push('/subscriptions');
      }
      subscriptionsApi.getAll(workspaceId)
        .then(data => setSubscriptions(data))
        .catch(() => {});
    }} 
  />;
}

  const uniqueProjects = Array.from(new Set(Array.isArray(subscriptions) ? subscriptions.flatMap(s => s.projects || []) : []));
  const now = new Date();
  
  const filteredSubscriptions = (Array.isArray(subscriptions) ? subscriptions : [])
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.projects.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesProject = filterProject === 'all' || s.projects.includes(filterProject);
      const matchesCycle = filterCycle === 'all' || s.renewalCycle === filterCycle;
      
      let matchesUrgency = true;
      if (filterUrgency !== 'all') {
        const daysUntil = Math.ceil((new Date(s.renewalDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (filterUrgency === 'urgent') matchesUrgency = daysUntil <= 7;
        if (filterUrgency === 'soon') matchesUrgency = daysUntil > 7 && daysUntil <= 30;
        if (filterUrgency === 'later') matchesUrgency = daysUntil > 30;
      }
      
      return matchesSearch && matchesProject && matchesCycle && matchesUrgency;
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return modifier * a.name.localeCompare(b.name);
      if (sortField === 'project') return modifier * (a.projects[0] || '').localeCompare(b.projects[0] || '');
      if (sortField === 'renewalDate') return modifier * (new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
      if (sortField === 'costAmount') return modifier * (Number(a.costAmount) - Number(b.costAmount));
      return 0;
    });

  const handleViewDetail = (id: number) => {
    if (setSelectedSubscriptionId && setCurrentPage) {
      // Old navigation (backward compatibility)
      setSelectedSubscriptionId(id);
      setCurrentPage('subscription-edit');
    } else {
      // New navigation (Next.js routing)
      router.push(`/subscriptions/${id}/edit`);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await subscriptionsApi.delete(deleteId);
      const data = await subscriptionsApi.getAll(workspaceId);
      setSubscriptions(data);
      
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch {
      toast.error('Error deleting subscription');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black text-gray-900">Subscriptions</h1>
          <span className="text-3xl">🍖</span>
        </div>
        <button 
  type="button" 
  onClick={() => setShowNewSubscription(true)}
  className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg border-2 border-green-300"
>
  <Plus className="w-5 h-5" />
  New subscription
</button>
      </div>

      {}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-4 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Search by name or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-medium"
            />
          </div>
          <select 
            value={sortField}
            onChange={(e) => setSortField(e.target.value as 'name' | 'renewalDate' | 'costAmount' | 'project')}
            className="px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
          >
            <option value="name">📝 Sort by name</option>
            <option value="project">📁 Sort by project</option>
            <option value="renewalDate">📅 Sort by renewal</option>
            <option value="costAmount">💰 Sort by cost</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="p-3 border-2 border-green-300 rounded-xl hover:bg-green-50 font-bold text-xl transform hover:scale-110 transition-all bg-white"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">🔍 Filters:</span>
          
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">📁 All projects</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>

          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">🔄 All cycles</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
            <option value="CUSTOM">Custom</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">⏰ All urgencies</option>
            <option value="urgent">🔥 Urgent (≤7 days)</option>
            <option value="soon">⚠️ Soon (8-30 days)</option>
            <option value="later">✅ Later (&gt;30 days)</option>
          </select>

          {(filterProject !== 'all' || filterCycle !== 'all' || filterUrgency !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setFilterProject('all');
                setFilterCycle('all');
                setFilterUrgency('all');
              }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition border-2 border-red-300"
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border-4 border-green-400 p-12 text-center shadow-xl">
          <div className="text-8xl mb-4">🦖</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">The dino is hungry!</h3>
          <p className="text-gray-600 mb-6 font-semibold">No subscriptions yet. Add the first one!</p>
          <button 
  type="button" 
  onClick={() => setShowNewSubscription(true)}
  className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300"
>
  🍖 Create subscription
</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-4 border-green-400 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-4 border-green-400">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Name</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Project</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Cycle</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Renewal</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Cost</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Users</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Last check</th>
                <th className="text-right px-6 py-4 text-sm font-black text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-green-200">
              {filteredSubscriptions.map(sub => (
                <tr 
  key={sub.id} 
  onClick={() => {
    if (setSelectedSubscriptionId && setCurrentPage) {
      setSelectedSubscriptionId(sub.id);
      setCurrentPage('subscription-view');
    } else {
      router.push(`/subscriptions/${sub.id}`);
    }
  }}
  className="hover:bg-green-50 transition-colors cursor-pointer"
>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{sub.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{sub.projects[0] || 'No project'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-700 border-2 border-blue-300">
                      {sub.renewalCycle}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{formatDate(sub.renewalDate)}</td>
                  <td className="px-6 py-4">
                   <div className="font-black text-gray-900">
                    {sub.costCurrency === 'EUR' ? '€' : sub.costCurrency === 'USD' ? '$' : '£'}{sub.costAmount}
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">{sub.costCurrency}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{sub.slackUserIds?.length || 0}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const lastCheck = getLastCheck(sub.id);
                      if (!lastCheck) {
                        return <span className="text-gray-400 text-sm font-semibold">No checks</span>;
                      }
                      return (
                        <div className="text-sm">
                          <div className="font-bold text-gray-900">{formatDate(lastCheck.sendAt)}</div>
                          <div className={`text-xs font-semibold ${
                            lastCheck.status === 'SENT' ? 'text-blue-600' :
                            lastCheck.status === 'CLOSED' ? 'text-gray-500' :
                            'text-yellow-600'
                          }`}>
                             {lastCheck.status}
                          </div>
                         </div>
                       );
                      })()}
                    </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleViewDetail(sub.id);
  }}
  className="p-2 text-blue-400 hover:text-blue-600 transition transform hover:scale-125"
  title="Edit"
>
  <Edit2 className="w-5 h-5" />
</button>
                      <button 
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(sub.id);
  }}
  className="p-2 text-red-400 hover:text-red-600 transition transform hover:scale-125"
  title="Delete"
>
  <Trash2 className="w-5 h-5" />
</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="text-7xl mb-4">🦖💥</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Devour this subscription?</h3>
            <p className="text-gray-600 mb-6 font-semibold">The dino will eat it and you won't be able to recover it...</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-400 to-orange-400 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition font-bold shadow-lg border-2 border-red-300"
              >
                Let it eat!
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}