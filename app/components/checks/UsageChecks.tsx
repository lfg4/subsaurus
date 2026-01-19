'use client';

import { ChevronRight, Search } from 'lucide-react';
import { formatDate } from '@/app/utils/formatDate';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usageChecksApi } from '@/app/lib/api';
import { UsageCheckStatus } from '@/src/types/enums';
import type { PageType } from '@/app/types';

interface UsageChecksProps {
  setCurrentPage?: (page: PageType) => void;
  setSelectedCheckId?: (id: number) => void;
  workspaceId: string;
}

export function UsageChecks({ setCurrentPage, setSelectedCheckId, workspaceId }: UsageChecksProps) {
  const router = useRouter();
  const [checks, setChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'subscriptionName' | 'sendAt' | 'status' | 'responsesCount'>('sendAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    usageChecksApi.getAll(undefined, workspaceId)
      .then(data => {
        setChecks(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => {
        setChecks([]);
        setIsLoading(false);
      });
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading usage checks...</div>
      </div>
    );
  }

  const handleViewDetail = (id: number) => {
    if (setSelectedCheckId && setCurrentPage) {
      // Old navigation (backward compatibility)
      setSelectedCheckId(id);
      setCurrentPage('check-detail');
    } else {
      // New navigation (Next.js routing)
      router.push(`/checks/${id}`);
    }
  };

  const filteredChecks = (Array.isArray(checks) ? checks : [])
    .filter(check => {
      const matchesSearch = check.subscriptionName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || check.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'subscriptionName') {
        return modifier * (a.subscriptionName || '').localeCompare(b.subscriptionName || '');
      }
      if (sortField === 'sendAt') {
        return modifier * (new Date(a.sendAt).getTime() - new Date(b.sendAt).getTime());
      }
      if (sortField === 'status') {
        return modifier * (a.status || '').localeCompare(b.status || '');
      }
      if (sortField === 'responsesCount') {
        return modifier * ((a.responsesCount || 0) - (b.responsesCount || 0));
      }
      return 0;
    });

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-black text-gray-900">Usage Checks</h1>
        <span className="text-3xl">✅</span>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border-4 border-purple-400 p-4 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Search by subscription name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-medium"
            />
          </div>
          <select 
            value={sortField}
            onChange={(e) => setSortField(e.target.value as 'subscriptionName' | 'sendAt' | 'status' | 'responsesCount')}
            className="px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-semibold bg-white"
          >
            <option value="subscriptionName">📝 Sort by subscription</option>
            <option value="sendAt">📅 Sort by sent date</option>
            <option value="status">🔔 Sort by status</option>
            <option value="responsesCount">💬 Sort by responses</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="p-3 border-2 border-purple-300 rounded-xl hover:bg-purple-50 font-bold text-xl transform hover:scale-110 transition-all bg-white"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">🔍 Filters:</span>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 font-semibold bg-white text-sm"
          >
            <option value="all">🔔 All statuses</option>
            <option value="SENT">📤 Sent</option>
            <option value="SCHEDULED">📅 Scheduled</option>
          </select>

          {(filterStatus !== 'all' || searchTerm !== '') && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition border-2 border-red-300"
            >
              ✕ Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredChecks.length === 0 && checks.length > 0 ? (
        <div className="bg-white rounded-2xl border-4 border-purple-400 p-12 text-center shadow-xl">
          <div className="text-8xl mb-4">🦖</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No matches found!</h3>
          <p className="text-gray-600 mb-6 font-semibold">Try adjusting your filters</p>
          <button 
            type="button" 
            onClick={() => {
              setFilterStatus('all');
              setSearchTerm('');
            }}
            className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg border-2 border-purple-300"
          >
            Clear filters
          </button>
        </div>
      ) : filteredChecks.length === 0 ? (
        <div className="bg-white rounded-2xl border-4 border-purple-400 p-12 text-center shadow-xl">
          <div className="text-8xl mb-4">🦖</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No usage checks yet!</h3>
          <p className="text-gray-600 font-semibold">Checks will be created automatically before renewals</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-4 border-purple-400 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-100 to-pink-100 border-b-4 border-purple-400">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Subscription</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Period</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Sent</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Responses</th>
                <th className="text-right px-6 py-4 text-sm font-black text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-purple-200">
              {filteredChecks.map((check: any) => (
                <tr key={check.id} className="hover:bg-purple-50 transition-colors cursor-pointer" onClick={() => handleViewDetail(check.id)}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{check.subscriptionName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold text-sm">
                    {formatDate(check.periodStart)} - {formatDate(check.periodEnd)}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{formatDate(check.sendAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-black rounded-full border-2 ${
                      check.status === UsageCheckStatus.SENT || check.status === 'SENT' ? 'bg-green-100 text-green-700 border-green-300' :
                      check.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                      'bg-yellow-100 text-yellow-700 border-yellow-300'
                    }`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">{check.responsesCount || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(check.id);
                        }}
                        className="p-2 text-purple-400 hover:text-purple-600 transition transform hover:scale-125"
                        title="View details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}