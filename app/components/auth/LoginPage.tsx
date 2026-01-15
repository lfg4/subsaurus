'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/app/lib/api';

export function LoginPage() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    authApi.getSession()
      .then(data => {
        if (data.valid) {
          window.location.href = '/';
        } else {
          setIsChecking(false);
        }
      })
      .catch(() => {
        setIsChecking(false);
      });
  }, []);

  const handleSlackLogin = () => {
    window.location.href = '/api/auth/slack/start';
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-8xl animate-bounce">🦖</div>
      </div>
    );
  }

  const errorMessages: Record<string, string> = {
    access_denied: 'You denied access to Subsaurus',
    workspace_not_found: 'Your workspace is not registered',
    workspace_inactive: 'Your workspace has been disabled',
    user_not_found: 'User not registered in the system',
    user_inactive: 'Your account has been disabled',
    admin_required: 'Only admins can access Subsaurus',
    authentication_failed: 'Authentication failed. Please try again',
    server_error: 'Server error. Please try again later',
  };

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const errorCode = urlParams?.get('error');
  const errorMessage = errorCode ? errorMessages[errorCode] || 'An error occurred during login' : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-4 border-green-400">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="text-8xl mb-2">🦖</div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Subsaurus</h1>
          <p className="text-lg text-gray-600 font-medium">The dinosaur that devours unnecessary subscriptions! 🍽️</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
            <p className="text-red-700 font-semibold text-sm text-center">
              ⚠️ {errorMessage}
            </p>
          </div>
        )}
        
        <button
          type="button"
          onClick={handleSlackLogin}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-label="Slack logo">
            <title>Slack</title>
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
          </svg>
          Sign in with Slack
        </button>

        <p className="text-sm text-gray-500 text-center mt-6 font-medium">
          🔒 Authorized admins only
        </p>
      </div>
    </div>
  );
}