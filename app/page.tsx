'use client';

import { useState, useEffect } from 'react';
import type { User } from '@/app/types';
import { LoginPage } from '@/app/components/auth/LoginPage';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { SubscriptionsList } from '@/app/components/subscriptions/SubscriptionsList';
import { SubscriptionDetail } from '@/app/components/subscriptions/SubscriptionDetail';
import { UsageChecks } from '@/app/components/checks/UsageChecks';
import { CheckDetail } from '@/app/components/checks/CheckDetail';
import { SettingsPage } from '@/app/components/settings/SettingsPage';
import { ImportWizard } from '@/app/components/import/ImportWizard';


const mockUser: User = {
  id: '1',
  slackUserId: 'U123456',
  slackWorkspaceId: 'T123456',
  displayName: 'Admin User',
  email: 'admin@company.com',
  avatarUrl: ''
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings' | 'import'>('subscriptions');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    setIsAuthenticated(true);
    setCurrentUser(mockUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🦖</div>
          <div className="text-xl font-bold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      <div className="pl-64">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        
        <main className="p-8">
          {currentPage === 'subscriptions' && (
            <SubscriptionsList 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setCurrentPage={setCurrentPage}
              setSelectedSubscriptionId={setSelectedSubscriptionId}
            />
          )}
          {currentPage === 'subscription-detail' && selectedSubscriptionId && (
            <SubscriptionDetail 
              subscriptionId={selectedSubscriptionId}
              setCurrentPage={setCurrentPage}
            />
          )}
          {currentPage === 'checks' && (
            <UsageChecks 
              setCurrentPage={setCurrentPage}
              setSelectedCheckId={setSelectedCheckId}
            />
          )}
          {currentPage === 'check-detail' && selectedCheckId && (
            <CheckDetail checkId={selectedCheckId} setCurrentPage={setCurrentPage} />
          )}
          {currentPage === 'settings' && <SettingsPage currentUser={currentUser} />}
          {currentPage === 'import' && currentUser && (
            <div>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-5xl">📤</span>
                <div>
                  <h1 className="text-4xl font-black text-gray-900">Import subscriptions</h1>
                  <p className="text-gray-600 font-semibold">Import your subscriptions from a CSV or Excel bank statement</p>
                </div>
              </div>
              <ImportWizard
                slackWorkspaceId={currentUser.slackWorkspaceId}
                createdBySlackUserId={currentUser.slackUserId}
                defaultSlackUserIds={[currentUser.slackUserId]}
                onComplete={() => setCurrentPage('subscriptions')}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}