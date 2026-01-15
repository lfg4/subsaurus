'use client';

import { ChevronRight, Clock } from 'lucide-react';
import { formatDate } from '@/app/utils/formatDate';
import { useState, useEffect } from 'react';

type PageType = 'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings';

interface CheckDetailProps {
  checkId: number;
  setCurrentPage: (page: PageType) => void;
}

export function CheckDetail({ checkId, setCurrentPage }: CheckDetailProps) {
  console.log('CheckDetail received checkId:', checkId);  
  const [check, setCheck] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
    console.log('Fetching data for checkId:', checkId);
    Promise.all([
      fetch(`/api/usage-checks/${checkId}`).then(res => res.json()),
      fetch(`/api/usage-checks/${checkId}/responses`).then(res => res.json())
    ])
      .then(([checkData, responsesData]) => {
        console.log('Check data received:', checkData);
        console.log('Responses data received:', responsesData);
        setCheck(checkData);
        setResponses(Array.isArray(responsesData) ? responsesData : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setIsLoading(false);
      });
  }, [checkId]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading usage check...</div>
      </div>
    );
  }
  
  if (!check) {
    return <div>Check not found</div>;
  }

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
          <h1 className="text-3xl font-bold text-gray-900">{check.subscriptionName}</h1>
          <p className="text-gray-600 mt-1">
            Check from {formatDate(check.periodStart)} to {formatDate(check.periodEnd)}
          </p>
        </div>
        {check.status === 'SENT' && (
          <button type="button" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Send reminder
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-green-600">
            {responses.filter(r => r.response === 'YES').length}
          </div>
          <div className="text-sm text-gray-600">Yes, uses it</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {responses.filter(r => r.response === 'LITTLE').length}
          </div>
          <div className="text-sm text-gray-600">Uses little</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-red-600">
            {responses.filter(r => r.response === 'NO').length}
          </div>
          <div className="text-sm text-gray-600">Does not use</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-2xl font-bold text-gray-600">
            {responses.filter(r => !r.response).length}
          </div>
          <div className="text-sm text-gray-600">Not responded</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User responses</h2>
        <div className="space-y-3">
          {responses.map((resp) => (
            <div key={resp.id} className={`flex items-center justify-between p-4 rounded-lg ${
              resp.response ? 'bg-gray-50' : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm ${
                  resp.response ? 'bg-indigo-600' : 'bg-orange-600'
                }`}>
                  {resp.slackUserId?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{resp.slackUserId}</div>
                  <div className="text-sm text-gray-500">User ID: {resp.slackUserId}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {resp.respondedAt && (
                  <div className="text-sm text-gray-500">{formatDate(resp.respondedAt)}</div>
                )}
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  resp.response === 'YES' ? 'bg-green-50 text-green-700' :
                  resp.response === 'LITTLE' ? 'bg-yellow-50 text-yellow-700' :
                  resp.response === 'NO' ? 'bg-red-50 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {resp.response === 'YES' ? 'Yes, uses it' : 
                   resp.response === 'LITTLE' ? 'Uses little' : 
                   resp.response === 'NO' ? 'Does not use' : 
                   'Not responded'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}