'use client';

import { ArrowLeft, Clock } from 'lucide-react';
import { formatDate } from '@/app/utils/formatDate';
import { useState, useEffect } from 'react';
import { usageChecksApi } from '@/app/lib/api';
import { UsageCheckStatus, UsageResponseType } from '@/src/types/enums';
import { toast } from 'sonner';
import type { PageType } from '@/app/types';

interface CheckDetailProps {
  checkId: number;
  setCurrentPage: (page: PageType) => void;
}

export function CheckDetail({ checkId, setCurrentPage }: CheckDetailProps) {
  const [check, setCheck] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

 useEffect(() => {
    Promise.all([
      usageChecksApi.getById(checkId),
      usageChecksApi.getResponses(checkId)
    ])
      .then(([checkData, responsesData]) => {
        setCheck(checkData);
        setResponses(Array.isArray(responsesData) ? responsesData : []);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [checkId]);

  const handleSendReminder = async () => {
    if (!checkId) return;
    
    setIsSendingReminder(true);
    try {
      const result = await usageChecksApi.resend(checkId);
      
      if (result.success) {
        if (result.total === 0) {
          toast.info(result.message || 'All users have already responded');
        } else {
          toast.success(`Reminders sent successfully! Sent: ${result.sent}, Failed: ${result.failed}, Total: ${result.total || 0}`);
        }
      } else {
        toast.error(result.message || 'Error sending reminders');
      }
    } catch {
      toast.error('Error sending reminders');
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Loading usage check...</div>
      </div>
    );
  }
  
  if (!check) {
    return (
      <div className="bg-white rounded-2xl border-4 border-red-400 p-12 text-center shadow-xl">
        <div className="text-8xl mb-4">🦖</div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Check not found!</h3>
        <p className="text-gray-600 font-semibold">The check you're looking for doesn't exist</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setCurrentPage('checks')}
            className="p-3 hover:bg-white/50 rounded-xl transition-all border-2 border-purple-300 bg-white"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-gray-900">{check.subscriptionName}</h1>
              
            </div>
            <p className="text-gray-600 font-semibold text-lg mt-1">
              📅 Check from {formatDate(check.periodStart)} to {formatDate(check.periodEnd)}
            </p>
          </div>
        </div>
        {check.status === UsageCheckStatus.SENT && (
          <button 
            type="button" 
            onClick={handleSendReminder}
            disabled={isSendingReminder}
            className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg border-2 border-purple-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Clock className="w-5 h-5" />
            {isSendingReminder ? 'Sending...' : 'Send reminder'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-4 border-green-400 p-6 shadow-lg transform hover:scale-105 transition-all">
          <div className="text-4xl font-black text-green-600 mb-2">
            {responses.filter(r => r.response === UsageResponseType.YES).length}
          </div>
          <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <span>✅</span> Yes, uses it
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-4 border-yellow-400 p-6 shadow-lg transform hover:scale-105 transition-all">
          <div className="text-4xl font-black text-yellow-600 mb-2">
            {responses.filter(r => r.response === UsageResponseType.LITTLE).length}
          </div>
          <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <span>⚠️</span> Uses little
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-4 border-red-400 p-6 shadow-lg transform hover:scale-105 transition-all">
          <div className="text-4xl font-black text-red-600 mb-2">
            {responses.filter(r => r.response === UsageResponseType.NO).length}
          </div>
          <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <span>❌</span> Does not use
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-4 border-gray-400 p-6 shadow-lg transform hover:scale-105 transition-all">
          <div className="text-4xl font-black text-gray-600 mb-2">
            {responses.filter(r => !r.response).length}
          </div>
          <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
            <span>⏳</span> Not responded
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-4 border-purple-400 p-6 shadow-xl">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <span>👥</span> User responses
        </h2>
        {responses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🦖</div>
            <p className="text-gray-600 font-semibold">No responses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((resp) => (
              <div key={resp.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                resp.response ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg ${
                    resp.response ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-orange-500 to-red-500'
                  }`}>
                    {resp.slackUserId?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{resp.slackUserId}</div>
                    <div className="text-sm text-gray-500 font-semibold">User ID: {resp.slackUserId}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {resp.respondedAt && (
                    <div className="text-sm text-gray-600 font-semibold">📅 {formatDate(resp.respondedAt)}</div>
                  )}
                  <span className={`px-4 py-2 text-sm font-black rounded-full border-2 shadow-md ${
                    resp.response === UsageResponseType.YES ? 'bg-green-100 text-green-700 border-green-300' :
                    resp.response === UsageResponseType.LITTLE ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                    resp.response === UsageResponseType.NO ? 'bg-red-100 text-red-700 border-red-300' :
                    'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {resp.response === UsageResponseType.YES ? '✅ Yes, uses it' : 
                     resp.response === UsageResponseType.LITTLE ? '⚠️ Uses little' : 
                     resp.response === UsageResponseType.NO ? '❌ Does not use' : 
                     '⏳ Not responded'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}