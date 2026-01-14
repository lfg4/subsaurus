'use client';

import { LogOut } from 'lucide-react';
import type { User } from '@/app/types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
}

export function Header({ currentUser, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b-4 border-green-400 px-8 py-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🦖</span>
          <span className="text-lg font-bold text-gray-600">is hunting subscriptions...</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border-2 border-green-300">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-black shadow-lg">
              {currentUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <div className="font-bold text-gray-900">{currentUser?.displayName}</div>
              <div className="text-gray-600">{currentUser?.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-all transform hover:scale-110"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}