'use client';

import { useState } from 'react';
import { Calendar, DollarSign } from 'lucide-react';

interface Transaction {
  date: Date;
  description: string;
  amount: number;
  currency: string;
}

interface ManualSubscriptionSelectorProps {
  transactions: Transaction[];
  onConfirm: (selectedTransactions: Transaction[]) => void;
  onBack: () => void;
}

export function ManualSubscriptionSelector({ 
  transactions, 
  onConfirm, 
  onBack 
}: ManualSubscriptionSelectorProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const expenses = transactions.filter(tx => tx.amount < 0);

  const groupedTransactions = expenses.reduce((acc, tx, idx) => {
    const key = tx.description.toLowerCase().trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ transaction: tx, index: idx });
    return acc;
  }, {} as Record<string, Array<{ transaction: Transaction; index: number }>>);

  const filteredGroups = Object.entries(groupedTransactions).filter(([desc]) =>
    desc.includes(searchTerm.toLowerCase())
  );

  const toggleGroup = (indices: number[]) => {
    const allSelected = indices.every(idx => selectedIndices.has(idx));
    const newSelected = new Set(selectedIndices);
    
    if (allSelected) {
      indices.forEach(idx => {
        newSelected.delete(idx);
      });
    } else {
      indices.forEach(idx => {
        newSelected.add(idx);
      });
    }
    
    setSelectedIndices(newSelected);
  };

  const handleConfirm = () => {
    const selectedGroups: Array<{ description: string; transactions: Transaction[] }> = [];
    
    for (const [description, items] of Object.entries(groupedTransactions)) {
      const hasSelectedTransaction = items.some(item => selectedIndices.has(item.index));
      
      if (hasSelectedTransaction) {
        selectedGroups.push({
          description,
          transactions: items.map(item => item.transaction),
        });
      }
    }
    
    const transactionsWithMetadata = selectedGroups.flatMap(group => 
      group.transactions.map((tx, idx) => ({
        ...tx,
        _groupKey: group.description,
        _isGroupStart: idx === 0,
      }))
    );
    
    onConfirm(transactionsWithMetadata as Transaction[]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🎯</span>
        <div>
          <h3 className="text-2xl font-black text-gray-900">
            Select subscriptions manually
          </h3>
          <p className="text-base text-gray-600 font-semibold">
            Choose which transactions you want to convert into subscriptions
          </p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search by description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-4 border-4 border-green-300 rounded-xl focus:ring-4 focus:ring-green-400 focus:border-green-500 font-bold bg-white text-gray-900 text-base shadow-md"
        />
      </div>

      {expenses.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-xl font-black text-blue-800">
            📊 {Object.keys(groupedTransactions).length} unique descriptions
          </div>
          <div className="px-4 py-2 bg-purple-50 border-2 border-purple-300 rounded-xl font-black text-purple-800">
            💰 {expenses.length} total expenses
          </div>
          <div className="px-4 py-2 bg-green-50 border-2 border-green-300 rounded-xl font-black text-green-800">
            ✅ {selectedIndices.size} selected
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-12 bg-red-50 border-4 border-red-300 rounded-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No transactions loaded</h3>
          <p className="text-gray-600 font-semibold">There seems to be a problem loading the transactions.</p>
        </div>
      )}

      {transactions.length > 0 && expenses.length === 0 && (
        <div className="text-center py-12 bg-yellow-50 border-4 border-yellow-300 rounded-2xl">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-black text-gray-900 mb-2">No expenses found</h3>
          <p className="text-gray-600 font-semibold">All transactions seem to be income (positive amounts). Only negative amounts can be subscriptions.</p>
        </div>
      )}

      {expenses.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredGroups.map(([description, items]) => {
            const allSelected = items.every(item => selectedIndices.has(item.index));
            const someSelected = items.some(item => selectedIndices.has(item.index));
            const indices = items.map(item => item.index);

            return (
              <div
                key={description}
                className={`
                  border-4 rounded-2xl overflow-hidden transition-all shadow-lg
                  ${allSelected 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' 
                    : someSelected
                      ? 'border-yellow-400 bg-yellow-50'
                      : 'border-gray-300 bg-white'
                  }
                `}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleGroup(indices)}
                      className="mt-1 w-6 h-6 text-green-600 rounded-lg focus:ring-2 focus:ring-green-500 border-2 border-green-300"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-black text-gray-900 text-lg">
                          {items[0].transaction.description}
                        </h4>
                        <span className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-full font-black text-sm text-gray-700">
                          {items.length} {items.length === 1 ? 'transaction' : 'transactions'}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {items.slice(0, 3).map((item) => (
                          <div
                            key={item.index}
                            className="flex items-center gap-4 text-sm font-semibold text-gray-700 bg-white p-2 rounded-lg border-2 border-gray-200"
                          >
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span>{item.transaction.date.toLocaleDateString('es-ES')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="font-black">
                                {Math.abs(item.transaction.amount).toFixed(2)} {item.transaction.currency}
                              </span>
                            </div>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="text-xs text-gray-500 font-semibold px-2">
                            ... and {items.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredGroups.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-600 font-semibold">No transactions found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t-4 border-green-300">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-bold border-2 border-gray-300 transform hover:scale-105"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedIndices.size === 0}
          className={`
            px-8 py-4 rounded-xl font-black text-lg transition-all transform shadow-lg border-2
            ${selectedIndices.size > 0
              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white hover:from-green-500 hover:to-emerald-500 hover:scale-105 border-green-300'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
            }
          `}
        >
          🦖 Process selection ({selectedIndices.size} {selectedIndices.size === 1 ? 'group' : 'groups'})
        </button>
      </div>
    </div>
  );
}
