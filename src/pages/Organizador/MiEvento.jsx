import React, { useState, useMemo, useEffect } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
} from 'react-icons/fi';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import { organizerService } from '../../services/organizerService.js';
import { getCategoryNames } from '../../services/categoryService.js';

const toneMap = {
  PUBLICADO: 'active',
  FINALIZADO: 'neutral',
  BORRADOR: 'warning',
  CANCELADO: 'danger',
  SUSPENDIDO: 'danger',
  PENDIENTE_REVISION: 'warning',
  EN_CORRECCION: 'warning',
  RECHAZADO: 'danger',
};

const labelMap = {
  PUBLICADO: 'Activo',
  FINALIZADO: 'Finalizado',
  BORRADOR: 'Borrador',
  CANCELADO: 'Cancelado',
  SUSPENDIDO: 'Suspendido',
  PENDIENTE_REVISION: 'En revisión',
  EN_CORRECCION: 'En corrección',
  RECHAZADO: 'Rechazado',
};

export default function MiEvento({ onCreate, onViewDetail, externalSearch = '' }) {
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      organizerService.getEventosOrganizador({ page: 0, size: 200 }),
      getCategoryNames(),
    ])
      .then(([eventsData, categoriesData]) => {
        if (!isMounted) return;
        const normalized = (eventsData || []).map((e) => ({
          ...e,
          id: e.id,
          title: e.titulo || e.title || 'Sin título',
          category: typeof e.categoria === 'string' ? e.categoria : e.categoria?.nombre || e.nombreCategoria || 'Evento',
          date: e.fecha || e.date || 'Próximamente',
          time: e.hora || e.time || '7:00 PM',
          location: e.lugar || e.ubicacion || e.location || '',
          status: labelMap[e.estado] || e.estado || 'Borrador',
          rawStatus: e.estado || 'BORRADOR',
          tone: toneMap[e.estado] || 'warning',
          photo: e.foto || e.imagen || null,
        }));
        setOrganizerEvents(normalized);
        if (categoriesData) setCategoryOptions(categoriesData);
      })
      .catch((err) => {
        console.error('Error cargando eventos:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const effectiveSearch = externalSearch || localSearch;

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    return organizerEvents.filter((event) => {
      const matchesCategory = category === 'Todos' || event.category === category;
      const matchesStatus = statusFilter === 'Todos' || event.status === statusFilter;
      const term = effectiveSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        event.title.toLowerCase().includes(term) ||
        (event.location && event.location.toLowerCase().includes(term)) ||
        event.category.toLowerCase().includes(term);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [organizerEvents, category, statusFilter, effectiveSearch]);

  // Métricas calculadas dinámicamente
  const activeCount = organizerEvents.filter((e) => e.rawStatus === 'PUBLICADO').length;
  const draftCount = organizerEvents.filter((e) => e.rawStatus === 'BORRADOR' || e.rawStatus === 'EN_CORRECCION').length;
  const finishedCount = organizerEvents.filter((e) => e.rawStatus === 'FINALIZADO').length;

  const handleDelete = async (eventId, rawStatus) => {
    // Item 4: Finalized events cannot be deleted
    if (rawStatus === 'FINALIZADO') return;
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return;
    try {
      await organizerService.eliminarEvento(eventId);
      setOrganizerEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      alert(err.message || 'Error al eliminar el evento');
    }
  };

  // Columnas para la vista en tabla — item 4: table only
  const eventTableColumns = [
    {
      header: 'Evento',
      key: 'title',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.photo && (
            <img
              src={row.photo}
              alt={row.title}
              className="h-11 w-14 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-slate-900 truncate text-xs hover:text-brand transition-colors">
              {row.title}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <FiCalendar size={11} className="text-slate-400" />
              <span>{row.date}</span>
              <span className="text-slate-300">•</span>
              <FiClock size={11} className="text-slate-400" />
              <span>{row.time || '7:00 PM'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoría',
      key: 'category',
      render: (val) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
          <FiTag size={10} className="text-slate-400" />
          {val}
        </span>
      ),
    },
    {
      header: 'Estado',
      key: 'status',
      render: (val, row) => <Badge tone={row.tone}>{val}</Badge>,
    },
    {
      header: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Ver detalle"
            onClick={() => onViewDetail && onViewDetail(row.id)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand hover:text-white transition-colors"
          >
            <FiEye size={13} />
          </button>
          {/* Item 4: No delete button for finalized events */}
          {row.rawStatus !== 'FINALIZADO' && (
            <button
              type="button"
              title="Eliminar evento"
              onClick={() => handleDelete(row.id, row.rawStatus)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
            >
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Mis Eventos
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Controla tu cartelera en tiempo real, supervisa la venta de aforo, configura estados y publica nuevas experiencias.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all hover:shadow-lg active:scale-95 shrink-0"
        >
          <FiPlus size={16} /> Crear nuevo evento
        </button>
      </div>

      {/* 2. KPIs — item 4: activos, borrador, finalizados (NO aforo total) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Eventos Activos"
          value={String(activeCount)}
          change="En cartelera activa"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Eventos en Borrador"
          value={String(draftCount)}
          change="Pendientes por publicar"
          trend="up"
          icon={FiEdit3}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Eventos Finalizados"
          value={String(finishedCount)}
          change="Completados con éxito"
          trend="up"
          icon={FiCalendar}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
      </div>

      {/* 3. Barra de Filtros — item 4: categoría, estado (org auto-detected) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todas</option>
              {categoryOptions.map((c) => (
                <option key={c.id || c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activos</option>
              <option value="Borrador">Borradores</option>
              <option value="Finalizado">Finalizados</option>
              <option value="En revisión">En revisión</option>
              <option value="Suspendido">Suspendidos</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          {/* Buscador interno */}
          {!externalSearch && (
            <div className="relative flex-1 sm:w-60">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por título o lugar..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Vista en Tabla únicamente — item 4 */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando eventos de tu organización...</p>
        </div>
      ) : (
        <DataTable
          title="Listado de Eventos"
          subtitle={`Mostrando ${filteredEvents.length} eventos`}
          columns={eventTableColumns}
          data={filteredEvents}
          paginate={true}
          initialPageSize={10}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No se encontraron eventos"
          emptyDescription="Ajusta los filtros o agrega un nuevo evento a tu cartelera."
        />
      )}
    </div>
  );
}