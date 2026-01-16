'use client';

import { Check, ChevronRight } from 'lucide-react';
import { formatDate } from '@/app/utils/formatDate';
import { useState, useEffect } from 'react';
import { usageChecksApi } from '@/app/lib/api';
import { UsageCheckStatus } from '@/src/types/enums';
import type { PageType } from '@/app/types';

interface UsageChecksProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedCheckId: (id: number) => void;
  workspaceId: string;
}

export function UsageChecks({ setCurrentPage, setSelectedCheckId, workspaceId }: UsageChecksProps) {
  const [checks, setChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setSelectedCheckId(id);
    setCurrentPage('check-detail');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Usage Checks</h1>

      {checks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Check className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No usage checks</h3>
          <p className="text-gray-600">Checks will be created automatically before renewals</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Subscription</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sent</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Responses</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {checks.map((check: any) => (
                <tr key={check.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{check.subscriptionName}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(check.periodStart)} - {formatDate(check.periodEnd)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(check.sendAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      check.status === UsageCheckStatus.SENT ? 'bg-blue-50 text-blue-700' :
                      check.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{check.responsesCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => handleViewDetail(check.id)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition"
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