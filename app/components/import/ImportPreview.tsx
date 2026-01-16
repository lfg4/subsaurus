'use client';

import { useState } from 'react';
import {  TrendingUp, Calendar, DollarSign } from 'lucide-react';
import type { SubscriptionPreview } from '@/app/lib/api';
import { toast } from 'sonner';
import { getCurrencySymbol } from '@/app/utils/currency';

interface ImportPreviewProps {
  subscriptions: SubscriptionPreview[];
  onConfirm: (selectedNames: string[]) => void;
  onBack: () => void;
  isImporting?: boolean;
}

export function ImportPreview({ 
  subscriptions, 
  onConfirm, 
  onBack,
  isImporting = false 
}: ImportPreviewProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    new Set(subscriptions.map(s => s.name))
  );
  const [expandedName, setExpandedName] = useState<string | null>(null);

  const toggleSelection = (name: string) => {
    const newSelected = new Set(selectedNames);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedNames(newSelected);
  };

  const toggleExpand = (name: string) => {
    setExpandedName(expandedName === name ? null : name);
  };

  const getConfidenceColor = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 80) return 'text-green-600 bg-green-50';
    if (value >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      semestral: 'Semestral',
      yearly: 'Yearly',
    };
    return labels[cycle] || cycle;
  };

  const handleConfirm = () => {
    if (selectedNames.size === 0) {
      toast.warning('Select at least one subscription to import');
      return;
    }
    onConfirm(Array.from(selectedNames));
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-6 animate-bounce">🦖</div>
        <h3 className="text-3xl font-black text-gray-900 mb-3">
          The dino found nothing!
        </h3>
        <p className="text-gray-600 font-semibold mb-8 max-w-md mx-auto">
          No recurring expense patterns were found in the file.
          Try with a file that contains more historical transactions.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all transform hover:scale-105 font-black text-lg shadow-lg border-2 border-gray-400"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🍖</span>
        <div>
          <h3 className="text-2xl font-black text-gray-900">
            Detected subscriptions ({subscriptions.length})
          </h3>
          <p className="text-base text-gray-600 font-semibold">
            Select the subscriptions you want to import
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {subscriptions.map((sub) => {
          const isSelected = selectedNames.has(sub.name);
          const isExpanded = expandedName === sub.name;

          return (
            <div
              key={sub.name}
              className={`
                border-4 rounded-2xl overflow-hidden transition-all shadow-lg
                ${isSelected ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-gray-300 bg-white'}
              `}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(sub.name)}
                    className="mt-1 w-6 h-6 text-green-600 rounded-lg focus:ring-2 focus:ring-green-500 border-2 border-green-300"
                    disabled={isImporting}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-black text-gray-900 text-xl">
                          {sub.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-black border-2 ${getConfidenceColor(sub.confidence)}`}>
                            Confidence: {sub.confidence}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900">
                          {sub.amount}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <TrendingUp className="w-5 h-5" />
                        <span>{getCycleLabel(sub.cycle)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Calendar className="w-5 h-5" />
                        <span>Next: {sub.nextRenewal}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        <DollarSign className="w-5 h-5" />
                        <span>{sub.occurrences} transactions</span>
                      </div>
                    </div>

                    {sub.transactions.length > 0 && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleExpand(sub.name)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-black"
                        >
                          {isExpanded ? '🔼 Hide' : '🔽 Show'} history
                        </button>

                        {isExpanded && (
                          <div className="mt-3 bg-white rounded-xl border-2 border-gray-300 p-4">
                            <div className="space-y-2">
                              {sub.transactions.map((tx, idx) => (
                                <div
                                  key={`transaction-${idx}`}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-gray-600">{tx.date}</span>
                                  <span className="font-medium text-gray-900">
  {getCurrencySymbol(tx.currency || 'EUR')}{tx.amount.toFixed(2)} {tx.currency || 'EUR'}
</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t-4 border-green-300">
        <button
          type="button"
          onClick={onBack}
          disabled={isImporting}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-bold border-2 border-gray-300 disabled:opacity-50 transform hover:scale-105"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          <div className="text-base text-gray-700 font-black px-4 py-2 bg-gray-100 rounded-xl border-2 border-gray-300">
            {selectedNames.size} of {subscriptions.length} selected
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedNames.size === 0 || isImporting}
            className={`
              px-8 py-4 rounded-xl font-black text-lg transition-all transform shadow-lg border-2
              ${selectedNames.size > 0 && !isImporting
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 hover:scale-105 border-green-300'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
              }
            `}
          >
            {isImporting ? '⏳ Importing...' : '🦖 Import selected'}
          </button>
        </div>
      </div>
    </div>
  );
}

