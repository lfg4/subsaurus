'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import type { User, PageType } from '@/app/types';
import { analyticsApi, type DashboardData } from '@/app/lib/api';
import { getCurrencySymbol } from '@/app/utils/currency';

interface DashboardPageProps {
  currentUser: User;
  setCurrentPage: (page: PageType) => void;
  setSelectedSubscriptionId: (id: number) => void;
}

export function DashboardPage({ currentUser, setCurrentPage, setSelectedSubscriptionId }: DashboardPageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [healthTab, setHealthTab] = useState<'ready-to-cancel' | 'low-usage'>('ready-to-cancel');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    analyticsApi.getDashboard(currentUser.slackWorkspaceId)
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [currentUser.slackWorkspaceId]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsProjectDropdownOpen(false);
    }
  };

  if (isProjectDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isProjectDropdownOpen]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading dashboard...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🦖</div>
        <div className="text-xl font-bold text-gray-700">Failed to load dashboard</div>
      </div>
    );
  }

  const readyToCancelCount = data.subscriptionHealth.filter(s => s.status === 'ready-to-cancel').length;
  const lowUsageCount = data.subscriptionHealth.filter(s => s.status === 'low-usage').length;
  const filteredHealth = data.subscriptionHealth.filter(s => s.status === healthTab);

  const filteredProjects = selectedProjects.size === 0 
    ? data.projectExpenses 
    : data.projectExpenses.filter(p => selectedProjects.has(p.project));

  const totalRenewalsAmount = data.upcomingRenewals.reduce((acc, renewal) => {
    const existing = acc.get(renewal.currency) || 0;
    acc.set(renewal.currency, existing + renewal.amount);
    return acc;
  }, new Map<string, number>());

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <span className="text-5xl">📊</span>
        <div>
          <h1 className="text-4xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-600 font-semibold">Monitor your subscription spending</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-4 border-green-400 p-8 shadow-xl">
        <div className="text-sm font-bold text-gray-600 mb-2">TOTAL MONTHLY SPENDING</div>
        <div className="flex items-baseline gap-4 flex-wrap">
          {data.currencyTotals.map((total, idx) => (
            <div key={total.currency} className="flex items-baseline gap-2">
              {idx > 0 && <span className="text-2xl font-black text-gray-400">+</span>}
              <span className="text-5xl font-black text-gray-900">
                {getCurrencySymbol(total.currency)}{total.totalMonthly.toFixed(2)}
              </span>
              <span className="text-xl font-bold text-gray-600">{total.currency}</span>
            </div>
          ))}
        </div>
        <div className="text-sm font-semibold text-gray-600 mt-2">
          {data.currencyTotals.reduce((sum, t) => sum + t.subscriptionCount, 0)} active subscriptions
        </div>
      </div>

<div className={`bg-white rounded-2xl border-4 p-6 shadow-lg ${
        readyToCancelCount === 0 && lowUsageCount === 0 ? 'border-green-400' : 'border-red-400'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <AlertTriangle className={`w-6 h-6 ${
              readyToCancelCount === 0 && lowUsageCount === 0 ? 'text-green-600' : 'text-red-600'
            }`} />
            Subscription Health
          </h2>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setHealthTab('ready-to-cancel')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              healthTab === 'ready-to-cancel'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚨 Ready to Cancel ({readyToCancelCount})
          </button>
          <button
            type="button"
            onClick={() => setHealthTab('low-usage')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              healthTab === 'low-usage'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⚠️ Low Usage ({lowUsageCount})
          </button>
        </div>

        <div className="space-y-2">
          {filteredHealth.length > 0 ? (
            filteredHealth.map(sub => (
              <div
                key={sub.id}
                className={`p-4 rounded-lg border-2 ${
                  sub.status === 'ready-to-cancel'
                    ? 'bg-red-50 border-red-300'
                    : 'bg-yellow-50 border-yellow-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{sub.name}</div>
                    <div className="text-sm text-gray-600 font-semibold mt-1">
                      {sub.reason}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900">
                      {getCurrencySymbol(sub.currency)}{sub.monthlyEquivalent.toFixed(2)}/mo
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-8xl mb-4">🦖✨</div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">
                {healthTab === 'ready-to-cancel' 
                  ? 'No subscriptions ready to cancel!' 
                  : 'No subscriptions with low usage!'}
              </h3>
              <p className="text-gray-600 font-semibold">
                {healthTab === 'ready-to-cancel'
                  ? 'Nothing to devour today! Everyone is using their subscriptions 😢'
                  : 'The dino is on the hunt - ready to catch any low-usage subscriptions! 🎯'}
              </p>
            </div>
          )}
        </div>
      </div>

      {data.upcomingRenewals.length > 0 && (
        <div className="bg-white rounded-2xl border-4 border-blue-400 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Renewing Soon (next 30 days)
          </h2>
          <div className="flex gap-2 mb-4">
            {Array.from(totalRenewalsAmount.entries()).map(([currency, amount]) => (
              <div key={currency} className="px-3 py-1 bg-blue-100 border-2 border-blue-300 rounded-lg">
                <span className="text-sm font-bold text-blue-900">
                  Total: {getCurrencySymbol(currency)}{amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
  {data.upcomingRenewals.map(renewal => (
    <button
      key={renewal.id}
      type="button"
      onClick={() => {
        setSelectedSubscriptionId(renewal.id);
      }}
      className="w-full flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer"
    >
                <div>
                  <div className="font-bold text-gray-900">{renewal.name}</div>
                  <div className="text-sm text-gray-600 font-semibold">
                    In {renewal.daysUntil} {renewal.daysUntil === 1 ? 'day' : 'days'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-gray-900">
                    {getCurrencySymbol(renewal.currency)}{renewal.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 font-semibold">
                    {new Date(renewal.renewalDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
    </button>
  ))}
</div>
        </div>
      )}

     {data.projectExpenses.length > 0 && (
        <div className="bg-white rounded-2xl border-4 border-purple-400 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Spending by Project
          </h2>
          
        <div className="mb-4" ref={dropdownRef}>
  <label className="block text-sm font-bold text-gray-700 mb-2">
    Filter by Project
  </label>
  <div className="relative">
    <button
      type="button"
      onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
      className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-semibold bg-white text-left flex items-center justify-between"
    >
      <span className="text-gray-700">
        {selectedProjects.size > 0 
          ? `${selectedProjects.size} project${selectedProjects.size > 1 ? 's' : ''} selected`
          : 'Select projects...'}
      </span>
      <span className="text-purple-600">{isProjectDropdownOpen ? '▲' : '▼'}</span>
    </button>
    
    {isProjectDropdownOpen && (
      <div className="absolute z-10 mt-1 w-full bg-white border-2 border-purple-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
        {Array.from(new Set(data.projectExpenses.map(p => p.project))).map(project => (
          <label
            key={project}
            className="flex items-center px-4 py-2 hover:bg-purple-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedProjects.has(project)}
              onChange={(e) => {
                const newSelected = new Set(selectedProjects);
                if (e.target.checked) {
                  newSelected.add(project);
                } else {
                  newSelected.delete(project);
                }
                setSelectedProjects(newSelected);
              }}
              className="mr-3 w-4 h-4 text-purple-600 rounded focus:ring-purple-400"
            />
            <span className="font-semibold text-gray-700">{project}</span>
          </label>
        ))}
      </div>
    )}
  </div>
  
  {selectedProjects.size > 0 && (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 text-sm font-semibold text-gray-600">
        Selected: {Array.from(selectedProjects).join(', ')}
      </div>
      <button
        type="button"
        onClick={() => setSelectedProjects(new Set())}
        className="px-3 py-1 rounded-lg font-bold text-sm bg-red-100 text-red-600 hover:bg-red-200"
      >
        Clear
      </button>
    </div>
  )}
</div>

          <div className="space-y-3">
            {filteredProjects.map((project, idx) => {
              const total = data.projectExpenses
                .filter(p => p.currency === project.currency)
                .reduce((sum, p) => sum + p.monthlyAmount, 0);
              const percentage = (project.monthlyAmount / total) * 100;

              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-gray-900">{project.project}</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {getCurrencySymbol(project.currency)}{project.monthlyAmount.toFixed(2)}/mo ({project.subscriptionCount} subs)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-gray-300">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}