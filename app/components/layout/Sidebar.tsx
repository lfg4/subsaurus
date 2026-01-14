'use client';

import { FileText, Check, Settings } from 'lucide-react';

type PageType = 'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
}

export function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const menuItems: Array<{ id: PageType; label: string; icon: typeof FileText; emoji: string }> = [
    { id: 'subscriptions', label: 'Subscriptions', icon: FileText, emoji: '🍖' },
    { id: 'checks', label: 'Usage Checks', icon: Check, emoji: '✅' },
    { id: 'settings', label: 'Settings', icon: Settings, emoji: '⚙️' }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r-4 border-green-400 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="text-4xl">🦖</div>
        <span className="text-2xl font-black text-gray-900 tracking-tight">Subsaurus</span>
      </div>

      <nav className="space-y-2">
        {menuItems.map(item => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all transform ${
                isActive 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white font-bold shadow-lg scale-105' 
                  : 'text-gray-700 hover:bg-green-50 hover:scale-102'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300">
          <div className="text-3xl mb-2">💡</div>
          <p className="text-xs font-bold text-gray-700">
            The dino is hungry! Find subscriptions to devour.
          </p>
        </div>
      </div>
    </div>
  );
}