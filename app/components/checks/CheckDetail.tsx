'use client';

import { ChevronRight, Clock } from 'lucide-react';
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

interface CheckDetailProps {
  checkId: number;
  setCurrentPage: (page: PageType) => void;
}

export function CheckDetail({ checkId, setCurrentPage }: CheckDetailProps) {
  const check = mockUsageChecks.find((c: any) => c.id === checkId);
  
  if (!check) {
    return <div>Check not found</div>;
  }

  const mockResponses = [
    { user: 'User 1', email: 'user1@company.com', response: 'YES', respondedAt: '2026-01-10T14:30:00Z' },
    { user: 'User 2', email: 'user2@company.com', response: 'LITTLE', respondedAt: '2026-01-10T15:45:00Z' },
    { user: 'User 3', email: 'user3@company.com', response: 'YES', respondedAt: '2026-01-11T09:20:00Z' },
    { user: 'User 4', email: 'user4@company.com', response: 'YES', respondedAt: '2026-01-11T11:10:00Z' },
    { user: 'User 5', email: 'user5@company.com', response: 'YES', respondedAt: '2026-01-12T08:00:00Z' },
  ];

  return (
    <div>
      <button 
        type="button"
        onClick={() => setCurrentPage('checks')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Back to checks
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{(check as any).subscriptionName}</h1>
          <p className="text-gray-600 mt-1">
            Check from {formatDate((check as any).periodStart)} to {formatDate((check as any).periodEnd)}
          </p>
        </div>
        {(check as any).status === 'SENT' && (
          <button type="button" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Send reminder
          </button>
        )}
      </div>

      {}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">Yes, uses it</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">1</div>
          <div className="text-sm text-gray-600">Uses little</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">0</div>
          <div className="text-sm text-gray-600">Does not use</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">1</div>
          <div className="text-sm text-gray-600">Not responded</div>
        </div>
      </div>

      {}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User responses</h2>
        <div className="space-y-3">
          {mockResponses.map((resp) => (
            <div key={resp.user} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                  {resp.user.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{resp.user}</div>
                  <div className="text-sm text-gray-500">{resp.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">{formatDate(resp.respondedAt)}</div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  resp.response === 'YES' ? 'bg-green-50 text-green-700' :
                  resp.response === 'LITTLE' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-red-50 text-red-700'
                }`}>
                  {resp.response === 'YES' ? 'Yes, uses it' : resp.response === 'LITTLE' ? 'Uses little' : 'Does not use'}
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm">
                U6
              </div>
              <div>
                <div className="font-medium text-gray-900">User 6</div>
                <div className="text-sm text-gray-500">user6@company.com</div>
              </div>
            </div>
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
              Not responded
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}