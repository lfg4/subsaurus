'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus, X } from 'lucide-react';
import { Subscription } from '@/app/types';
import { formatDate } from '@/app/utils/formatDate';

// Mock temporal (hasta implementar usage checks)
const mockUsageChecks = [
  {
    id: 1,
    subscription_id: 1,
    subscription_name: 'Figma Professional',
    period_start: '2025-12-20',
    period_end: '2026-01-20',
    send_at: '2026-01-15T10:00:00Z',
    status: 'SENT',
    responses_count: 5
  },
  {
    id: 2,
    subscription_id: 2,
    subscription_name: 'GitHub Teams',
    period_start: '2025-12-15',
    period_end: '2026-01-15',
    send_at: '2026-01-10T10:00:00Z',
    status: 'SENT',
    responses_count: 10
  }
];

interface SubscriptionDetailProps {
  subscriptionId: number;
  setCurrentPage: (page: string) => void;
}

export function SubscriptionDetail({ subscriptionId, setCurrentPage }: SubscriptionDetailProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    project: '',
    renewal_cycle: 'MONTHLY' as 'MONTHLY' | 'YEARLY' | 'CUSTOM',
    renewal_date: '',
    cost_amount: 0,
    cost_currency: 'EUR'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/subscriptions/${subscriptionId}`)
      .then(res => res.json())
      .then(data => {
        setSubscription(data);
        setFormData({
          name: data.name,
          project: data.project,
          renewal_cycle: data.renewal_cycle,
          renewal_date: data.renewal_date,
          cost_amount: data.cost_amount,
          cost_currency: data.cost_currency
        });
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setIsLoading(false);
      });
  }, [subscriptionId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error al guardar');

      alert('✅ Cambios guardados correctamente');
      setCurrentPage('subscriptions');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Cargando suscripción...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4">🦖❓</div>
        <div className="text-xl font-bold text-gray-700">Suscripción no encontrada</div>
        <button 
          onClick={() => setCurrentPage('subscriptions')}
          className="mt-4 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300"
        >
          ← Volver a suscripciones
        </button>
      </div>
    );
  }

  return (
    <div>
      <button 
        onClick={() => setCurrentPage('subscriptions')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-semibold"
      >
        <ChevronRight className="w-5 h-5 rotate-180" />
        Volver a suscripciones
      </button>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-black text-gray-900">{subscription.name}</h1>
        <span className="text-3xl">✏️</span>
      </div>

      {/* Información general */}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 mb-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Información general
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Proyecto</label>
            <input 
              type="text" 
              value={formData.project}
              onChange={(e) => setFormData({...formData, project: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ciclo de renovación</label>
            <select 
              value={formData.renewal_cycle}
              onChange={(e) => setFormData({...formData, renewal_cycle: e.target.value as any})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value="MONTHLY">🔄 Mensual</option>
              <option value="YEARLY">📅 Anual</option>
              <option value="CUSTOM">⚙️ Personalizado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de renovación</label>
            <input 
              type="date" 
              value={formData.renewal_date}
              onChange={(e) => setFormData({...formData, renewal_date: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Coste</label>
            <input 
              type="number" 
              value={formData.cost_amount}
              onChange={(e) => setFormData({...formData, cost_amount: parseFloat(e.target.value)})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Moneda</label>
            <select 
              value={formData.cost_currency}
              onChange={(e) => setFormData({...formData, cost_currency: e.target.value})}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
            >
              <option value="EUR">💶 EUR</option>
              <option value="USD">💵 USD</option>
              <option value="GBP">💷 GBP</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Guardando...' : '💾 Guardar cambios'}
          </button>
          <button 
            onClick={() => setCurrentPage('subscriptions')}
            className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Usuarios asignados */}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Usuarios asignados ({subscription.users_count || 0})
          </h2>
          <button className="text-green-600 hover:text-green-700 font-bold flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300 hover:bg-green-100 transition">
            <Plus className="w-5 h-5" />
            Agregar usuario
          </button>
        </div>
        <div className="space-y-2">
          {subscription.users_count && subscription.users_count > 0 ? (
            Array.from({ length: subscription.users_count }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                    U{i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Usuario {i + 1}</div>
                    <div className="text-sm text-gray-600 font-semibold">user{i + 1}@company.com</div>
                  </div>
                </div>
                {subscription.last_check_summary && (
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-black rounded-lg border-2 ${
                      i % 3 === 0 ? 'bg-green-100 text-green-700 border-green-300' :
                      i % 3 === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-gray-100 text-gray-600 border-gray-300'
                    }`}>
                      {i % 3 === 0 ? '✅ Usa' : i % 3 === 1 ? '⚠️ Poco' : '❌ No respondió'}
                    </span>
                    <button className="p-2 text-gray-400 hover:text-red-600 transform hover:scale-125 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 font-semibold">
              No hay usuarios asignados todavía
            </div>
          )}
        </div>
      </div>

      {/* Histórico de checks */}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Histórico de usage checks
        </h2>
        <div className="space-y-3">
          {mockUsageChecks.filter((c: any) => c.subscription_id === subscriptionId).map((check: any) => (
            <div key={check.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div>
                <div className="font-bold text-gray-900">
                  {formatDate(check.period_start)} - {formatDate(check.period_end)}
                </div>
                <div className="text-sm text-gray-600 font-semibold">
                  Enviado: {formatDate(check.send_at)}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm font-black rounded-full border-2 ${
                  check.status === 'SENT' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                  check.status === 'CLOSED' ? 'bg-gray-100 text-gray-600 border-gray-300' :
                  'bg-yellow-100 text-yellow-700 border-yellow-300'
                }`}>
                  {check.status}
                </span>
                <span className="text-sm text-gray-600 font-bold">{check.responses_count} respuestas</span>
                <button className="text-green-600 hover:text-green-700 transform hover:scale-125 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {mockUsageChecks.filter((c: any) => c.subscription_id === subscriptionId).length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">🦖</div>
              <div className="text-gray-500 font-semibold">No hay usage checks para esta suscripción</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}