import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Eye,
  Calendar,
  Building2,
  RefreshCw,
  Award,
  CheckCircle2,
  DollarSign,
  Tag,
  Clock,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import EventDetailView from '../Organizador/EventDetailView.jsx';
import { httpClient } from '../../services/httpClient.js';
import { formatPrice } from '../../utils/formatters.js';

export default function MarketingPromocionesView() {
  const [promociones, setPromociones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Evento seleccionado para desplegar el modal a la derecha
  const [selectedEventId, setSelectedEventId] = useState(null);

  // Cargar promociones reales desde el backend (GET /api/promociones y GET /api/eventos/destacados)
  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true);
      const [promosRes, destacadosRes] = await Promise.allSettled([
        httpClient.get('/promociones', { page: 0, size: 50 }),
        httpClient.get('/eventos/destacados', { page: 0, size: 50 }),
      ]);

      const promosList =
        promosRes.status === 'fulfilled'
          ? Array.isArray(promosRes.value)
            ? promosRes.value
            : promosRes.value?.content || promosRes.value?.data || []
          : [];

      const destacadosList =
        destacadosRes.status === 'fulfilled'
          ? Array.isArray(destacadosRes.value)
            ? destacadosRes.value
            : destacadosRes.value?.content || destacadosRes.value?.data || []
          : [];

      // Combinar promociones registradas con eventos destacados posicionados
      const mergedItems = [];
      const seenEventIds = new Set();

      promosList.forEach((p) => {
        const evId = p.eventoId || p.id;
        seenEventIds.add(String(evId));
        mergedItems.push({
          id: p.id || evId,
          eventoId: evId,
          eventoNombre: p.eventoNombre || p.eventoTitulo || p.titulo || 'Evento Cultural',
          organizacionNombre: p.organizacionNombre || p.organizacion?.razonSocial || 'Organización Aliada',
          plan: p.plan || p.tipoPlan || (p.descuento ? `Plan Descuento ${p.descuento}%` : 'Destacado Home'),
          precio: p.precio || p.montoPagado || 50000,
          fechaInicio: p.fechaInicio || p.fecha || '2026-10-01',
          fechaFinal: p.fechaFinal || p.fechaFin || '2026-10-31',
          estado: (p.estado || (p.activo !== false ? 'ACTIVO' : 'FINALIZADO')).toUpperCase(),
          foto: p.foto || p.imagenUrl || null,
        });
      });

      destacadosList.forEach((d) => {
        if (!seenEventIds.has(String(d.id))) {
          seenEventIds.add(String(d.id));
          mergedItems.push({
            id: `dest-${d.id}`,
            eventoId: d.id,
            eventoNombre: d.titulo || d.title || 'Evento Destacado',
            organizacionNombre: d.organizacionNombre || d.organizacion?.razonSocial || 'Organización Cultural',
            plan: 'Posicionamiento Premium',
            precio: 100000,
            fechaInicio: d.fecha || '2026-10-01',
            fechaFinal: '2026-10-30',
            estado: 'ACTIVO',
            foto: d.foto || d.imagenUrl || null,
          });
        }
      });

      setPromociones(mergedItems);
    } catch (err) {
      console.warn('Error al cargar promociones de marketing:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromociones();
  }, [fetchPromociones]);

  // Filtrado
  const filteredPromociones = useMemo(() => {
    return promociones.filter((p) => {
      const matchPlan =
        selectedPlanFilter === 'TODOS' ||
        p.plan.toLowerCase().includes(selectedPlanFilter.toLowerCase());

      if (!matchPlan) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.eventoNombre?.toLowerCase().includes(term) ||
        p.organizacionNombre?.toLowerCase().includes(term) ||
        p.plan?.toLowerCase().includes(term)
      );
    });
  }, [promociones, selectedPlanFilter, searchTerm]);

  // Paginado en cliente
  const paginatedPromociones = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPromociones.slice(start, start + pageSize);
  }, [filteredPromociones, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Promociones y Posicionamiento de Eventos
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa los eventos de organizaciones que pagaron planes de posicionamiento y visibilidad en EventHive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPromociones}
            title="Recargar datos"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Planes Contratados</p>
            <p className="text-2xl font-black text-slate-900 leading-tight">{promociones.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Promociones Activas</p>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {promociones.filter((p) => p.estado === 'ACTIVO' || p.estado === 'VIGENTE').length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ingresos Estimados</p>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              {formatPrice(promociones.reduce((acc, p) => acc + (p.precio || 50000), 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por evento u organización..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 transition-all"
          />
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1 w-full md:w-auto overflow-x-auto">
          {['TODOS', 'Destacado Home', 'Posicionamiento Premium'].map((planFilter) => (
            <button
              key={planFilter}
              type="button"
              onClick={() => {
                setSelectedPlanFilter(planFilter);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedPlanFilter === planFilter
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {planFilter}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DE PROMOCIONES */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            Cargando promociones de organizaciones...
          </div>
        ) : filteredPromociones.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">
            No se encontraron promociones registradas que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Nombre de Evento</th>
                  <th className="py-3.5 px-4">Organización</th>
                  <th className="py-3.5 px-4">Plan que Pagó</th>
                  <th className="py-3.5 px-4">Vigencia / Estado</th>
                  <th className="py-3.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPromociones.map((p) => {
                  const isPremium = p.plan.toLowerCase().includes('premium');
                  const isActivo = p.estado === 'ACTIVO' || p.estado === 'VIGENTE';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nombre de evento */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center text-amber-400 font-bold text-xs border border-amber-400/40">
                            {p.foto ? (
                              <img src={p.foto} alt={p.eventoNombre} className="w-full h-full object-cover" />
                            ) : (
                              <span>★</span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1 max-w-[260px]">
                              {p.eventoNombre}
                            </p>
                            <span className="text-[10px] text-slate-400">ID #{p.eventoId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Organización */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{p.organizacionNombre}</span>
                        </div>
                      </td>

                      {/* Plan que pagó */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-black uppercase tracking-wider ${
                            isPremium
                              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs border border-amber-500/80'
                              : 'bg-amber-100/90 text-amber-900 border border-amber-300'
                          }`}
                        >
                          <Award size={12} />
                          <span>{p.plan}</span>
                        </span>
                      </td>

                      {/* Vigencia / Estado */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <Badge variant={isActivo ? 'success' : 'neutral'} size="sm">
                            {isActivo ? 'Vigente' : 'Finalizado'}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            Hasta {p.fechaFinal}
                          </span>
                        </div>
                      </td>

                      {/* Botón de detalle de evento */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedEventId(p.eventoId)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Detalle Evento</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {filteredPromociones.length > pageSize && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {paginatedPromociones.length} de {filteredPromociones.length} promociones
            </span>
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalItems={filteredPromociones.length}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal / Drawer a la derecha con el detalle del evento */}
      {selectedEventId && (
        <EventDetailView
          eventId={selectedEventId}
          isDrawer={true}
          onBack={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
