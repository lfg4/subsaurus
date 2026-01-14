'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { Subscription } from '@/app/types';
import { formatDate } from '@/app/utils/formatDate';
import { Modal } from '@/app/components/shared/Modal';

interface SubscriptionsListProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: string) => void;
  setSelectedSubscriptionId: (id: number) => void;
}

export function SubscriptionsList({ 
  searchTerm, 
  setSearchTerm, 
  setCurrentPage, 
  setSelectedSubscriptionId 
}: SubscriptionsListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<'name' | 'renewal_date' | 'cost_amount' | 'project'>('renewal_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(res => res.json())
      .then(data => {
        setSubscriptions(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-8xl mb-4 animate-bounce">🦖</div>
        <div className="text-xl font-bold text-gray-700">Cargando suscripciones...</div>
      </div>
    );
  }

  const uniqueProjects = Array.from(new Set((subscriptions || []).map(s => s.project)));
  const now = new Date();
  
  const filteredSubscriptions = subscriptions
    .filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.project.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = filterProject === 'all' || s.project === filterProject;
      const matchesCycle = filterCycle === 'all' || s.renewal_cycle === filterCycle;
      
      let matchesUrgency = true;
      if (filterUrgency !== 'all') {
        const daysUntil = Math.ceil((new Date(s.renewal_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (filterUrgency === 'urgent') matchesUrgency = daysUntil <= 7;
        if (filterUrgency === 'soon') matchesUrgency = daysUntil > 7 && daysUntil <= 30;
        if (filterUrgency === 'later') matchesUrgency = daysUntil > 30;
      }
      
      return matchesSearch && matchesProject && matchesCycle && matchesUrgency;
    })
    .sort((a, b) => {
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return modifier * a.name.localeCompare(b.name);
      if (sortField === 'project') return modifier * a.project.localeCompare(b.project);
      if (sortField === 'renewal_date') return modifier * (new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime());
      if (sortField === 'cost_amount') return modifier * (Number(a.cost_amount) - Number(b.cost_amount));
      return 0;
    });

  const handleViewDetail = (id: number) => {
    setSelectedSubscriptionId(id);
    setCurrentPage('subscription-detail');
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch(`/api/subscriptions/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar');

      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      setSubscriptions(data);
      
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar la suscripción');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black text-gray-900">Suscripciones</h1>
          <span className="text-3xl">🍖</span>
        </div>
        <button className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 flex items-center gap-2 shadow-lg border-2 border-green-300">
          <Plus className="w-5 h-5" />
          Nueva suscripción
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border-4 border-green-400 p-4 mb-6 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Buscar por nombre o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-medium"
            />
          </div>
          <select 
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white"
          >
            <option value="name">📝 Ordenar por nombre</option>
            <option value="project">📁 Ordenar por proyecto</option>
            <option value="renewal_date">📅 Ordenar por renovación</option>
            <option value="cost_amount">💰 Ordenar por coste</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className="p-3 border-2 border-green-300 rounded-xl hover:bg-green-50 font-bold text-xl transform hover:scale-110 transition-all bg-white"
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">🔍 Filtros:</span>
          
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">📁 Todos los proyectos</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>

          <select
            value={filterCycle}
            onChange={(e) => setFilterCycle(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">🔄 Todos los ciclos</option>
            <option value="MONTHLY">Mensual</option>
            <option value="YEARLY">Anual</option>
            <option value="CUSTOM">Personalizado</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className="px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 font-semibold bg-white text-sm"
          >
            <option value="all">⏰ Todas las urgencias</option>
            <option value="urgent">🔥 Urgente (≤7 días)</option>
            <option value="soon">⚠️ Próximamente (8-30 días)</option>
            <option value="later">✅ Más adelante (&gt;30 días)</option>
          </select>

          {(filterProject !== 'all' || filterCycle !== 'all' || filterUrgency !== 'all') && (
            <button
              onClick={() => {
                setFilterProject('all');
                setFilterCycle('all');
                setFilterUrgency('all');
              }}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold text-sm hover:bg-red-200 transition border-2 border-red-300"
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      {filteredSubscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border-4 border-green-400 p-12 text-center shadow-xl">
          <div className="text-8xl mb-4">🦖</div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">¡El dino tiene hambre!</h3>
          <p className="text-gray-600 mb-6 font-semibold">No hay suscripciones todavía. ¡Agrega la primera!</p>
          <button className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-6 py-3 rounded-xl font-bold hover:from-green-500 hover:to-emerald-500 transition-all transform hover:scale-105 shadow-lg border-2 border-green-300">
            🍖 Crear suscripción
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-4 border-green-400 overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-green-100 to-emerald-100 border-b-4 border-green-400">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Nombre</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Proyecto</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Ciclo</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Renovación</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Coste</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Usuarios</th>
                <th className="text-left px-6 py-4 text-sm font-black text-gray-700 uppercase">Último check</th>
                <th className="text-right px-6 py-4 text-sm font-black text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-green-200">
              {filteredSubscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{sub.name}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{sub.project}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-black rounded-full bg-blue-100 text-blue-700 border-2 border-blue-300">
                      {sub.renewal_cycle}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-semibold">{formatDate(sub.renewal_date)}</td>
                  <td className="px-6 py-4">
                    <div className="font-black text-gray-900">€{sub.cost_amount}</div>
                    <div className="text-xs text-gray-500 font-semibold">{sub.cost_currency}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{sub.users_count}</td>
                  <td className="px-6 py-4">
                    {sub.last_check_summary ? (
                      <div className="flex gap-1">
                        {sub.last_check_summary.yes > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-black rounded-lg bg-green-100 text-green-700 border-2 border-green-300">
                            {sub.last_check_summary.yes}✓
                          </span>
                        )}
                        {sub.last_check_summary.no > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-black rounded-lg bg-red-100 text-red-700 border-2 border-red-300">
                            {sub.last_check_summary.no}✗
                          </span>
                        )}
                        {sub.last_check_summary.little > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-black rounded-lg bg-yellow-100 text-yellow-700 border-2 border-yellow-300">
                            {sub.last_check_summary.little}~
                          </span>
                        )}
                        {sub.last_check_summary.no_response > 0 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-black rounded-lg bg-gray-100 text-gray-600 border-2 border-gray-300">
                            {sub.last_check_summary.no_response}—
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm font-semibold">Sin checks</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleViewDetail(sub.id)}
                        className="p-2 text-blue-400 hover:text-blue-600 transition transform hover:scale-125"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition transform hover:scale-125"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showDeleteModal && (
        <Modal onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="text-7xl mb-4">🦖💥</div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">¿Devorar esta suscripción?</h3>
            <p className="text-gray-600 mb-6 font-semibold">El dino se la comerá y no podrás recuperarla...</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-400 to-orange-400 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition font-bold shadow-lg border-2 border-red-300"
              >
                ¡Que se la coma!
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}