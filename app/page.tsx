'use client';

import { useState, useEffect } from 'react';
import { User, UsageCheck } from '@/app/types';
import { LoginPage } from '@/app/components/auth/LoginPage';
import { Sidebar } from '@/app/components/layout/Sidebar';
import { Header } from '@/app/components/layout/Header';
import { SubscriptionsList } from '@/app/components/subscriptions/SubscriptionsList';
import { SubscriptionDetail } from '@/app/components/subscriptions/SubscriptionDetail';
import { UsageChecks } from '@/app/components/checks/UsageChecks';
import { CheckDetail } from '@/app/components/checks/CheckDetail';
import { SettingsPage } from '@/app/components/settings/SettingsPage';

// Mock data temporal
const mockUser: User = {
  id: '1',
  slack_user_id: 'U123456',
  slack_workspace_id: 'T123456',
  display_name: 'Admin User',
  email: 'admin@company.com',
  avatar_url: ''
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'subscriptions' | 'subscription-detail' | 'checks' | 'check-detail' | 'settings'>('subscriptions');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<number | null>(null);
  const [selectedCheckId, setSelectedCheckId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular autenticación (por ahora)
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
          <div className="text-xl font-bold text-gray-700">Cargando...</div>
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
        </main>
      </div>
    </div>
  );
}