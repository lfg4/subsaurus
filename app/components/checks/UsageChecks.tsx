'use client';

import { Check, ChevronRight } from 'lucide-react';
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

interface UsageChecksProps {
  setCurrentPage: (page: string) => void;
  setSelectedCheckId: (id: number) => void;
}

export function UsageChecks({ setCurrentPage, setSelectedCheckId }: UsageChecksProps) {
  const checks = mockUsageChecks;

  const handleViewDetail = (id: number) => {
    setSelectedCheckId(id);
    setCurrentPage('check-detail');
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Usage Checks</h1>

      {checks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Check className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usage checks</h3>
          <p className="text-gray-600">Los checks se crearán automáticamente antes de las renovaciones</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Suscripción</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Período</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Enviado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Respuestas</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {checks.map((check: any) => (
                <tr key={check.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{check.subscription_name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(check.period_start)} - {formatDate(check.period_end)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(check.send_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      check.status === 'SENT' ? 'bg-blue-50 text-blue-700' :
                      check.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      {check.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{check.responses_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(check.id)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition"
                        title="Ver detalle"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}