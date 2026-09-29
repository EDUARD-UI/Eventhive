import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  Filter,
  Eye,
  History,
  Ban,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  MapPin,
  Tag,
  DollarSign,
  Ticket,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import AdminEventCard from '../../components/componentsAdmin/AdminEventCard.jsx';

export default function AdminEventosView({
  eventos = [],
  onVerDetalle,
  onVerHistorial,
  onSuspenderEvento,
  onReactivarEvento,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

  const filteredEvents = useMemo(() => {
    return eventos.filter((ev) => {
      const matchSearch =
        ev.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.organizacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.pulep?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.lugar?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEstado =
        filtroEstado === 'TODOS' || ev.estado === filtroEstado;

      return matchSearch && matchEstado;
    });
  }, [eventos, searchTerm, filtroEstado]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Controles de Vista y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por título, PULEP u organización..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1); }}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="PUBLICADO">Publicados</option>
            <option value="EN_REVISION">En Revisión</option>
            <option value="EN_CORRECCION">En Corrección</option>
            <option value="SUSPENDIDO">Suspendidos</option>
            <option value="FINALIZADO">Finalizados</option>
          </select>

          {/* Toggle Grid / Tabla */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* Visualización de Eventos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              No se encontraron eventos con los filtros seleccionados.
            </div>
          ) : (
            paginatedEvents.map((evento) => (
              <AdminEventCard
                key={evento.id}
                evento={evento}
                onVerDetalle={onVerDetalle}
                onVerHistorial={onVerHistorial}
                onSuspender={onSuspenderEvento}
                onReactivar={onReactivarEvento}
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Evento / Título</th>
                  <th className="py-3.5 px-4">Organización</th>
                  <th className="py-3.5 px-4">ID Evento</th>
                  <th className="py-3.5 px-4">Fecha y Lugar</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 hover:text-primary transition-colors cursor-pointer" onClick={() => onVerDetalle(ev)}>
                        {ev.titulo}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {ev.categoria?.nombre || ev.categoria || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {ev.organizacion?.nombre || ev.organizacion || 'Organización'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      #{ev.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{ev.fecha}</div>
                      <div className="text-[11px] text-slate-400">{ev.lugar}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          ev.estado === 'PUBLICADO'
                            ? 'success'
                            : ev.estado === 'SUSPENDIDO'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                      >
                        {ev.estado}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onVerDetalle(ev)}
                          className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Auditar Detalle"
                        >
                          <Eye className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        <button
                          onClick={() => onVerHistorial(ev)}
                          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Historial de Auditoría"
                        >
                          <History className="w-4 h-4" strokeWidth={1.75} />
                        </button>
                        {ev.estado === 'SUSPENDIDO' ? (
                          <button
                            onClick={() => onReactivarEvento(ev)}
                            className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Reactivar Evento"
                          >
                            <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onSuspenderEvento(ev)}
                            className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Suspender Administrativamente"
                          >
                            <Ban className="w-4 h-4" strokeWidth={1.75} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <Pagination
          currentPage={currentPage}
          totalItems={filteredEvents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[6, 12, 24]}
        />
      </div>
    </div>
  );
}
