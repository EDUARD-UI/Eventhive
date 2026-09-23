import React, { useState, useMemo } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiFilter,
  FiPlus,
  FiSearch,
  FiTag,
  FiUsers,
} from 'react-icons/fi';
import OrganizerEventCard from '../../components/componentsOrganizador/OrganizerEventCard.jsx';
import ViewToggle from '../../components/componentsOrganizador/ViewToggle.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerEvents } from '../../features/organizer/data/mockOrganizerData.js';

export default function MiEvento({ onCreate, externalSearch = '' }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [category, setCategory] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
  }, [category, statusFilter, effectiveSearch]);

  // Paginación para Grid
  const paginatedGridEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Si cambia el filtro y la página queda fuera de rango
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  if (currentPage > totalPages && currentPage !== 1) {
    setCurrentPage(1);
  }

  // Métricas calculadas dinámicamente
  const activeCount = organizerEvents.filter((e) => e.status === 'Activo').length;
  const draftCount = organizerEvents.filter((e) => e.status === 'Borrador').length;
  const finishedCount = organizerEvents.filter((e) => e.status === 'Finalizado').length;
  const totalCapacity = organizerEvents.reduce((acc, curr) => acc + (curr.capacity || 0), 0);

  // Columnas para la vista en tabla
  const eventTableColumns = [
    {
      header: 'Evento',
      key: 'title',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.photo}
            alt={row.title}
            className="h-11 w-14 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
          />
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
      header: 'Aforo / Vendidas',
      key: 'sold',
      render: (_, row) => {
        const percentage = row.capacity ? Math.round((row.sold / row.capacity) * 100) : 0;
        return (
          <div className="w-36">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-800">
                {row.sold} <span className="font-normal text-slate-400">/ {row.capacity}</span>
              </span>
              <span className="text-[10px] font-semibold text-brand">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percentage >= 90 ? 'bg-emerald-500' : 'bg-brand'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Precio',
      key: 'price',
      render: (val) => (
        <span className={`font-semibold ${val === 0 || val === 'Gratis' ? 'text-emerald-600' : 'text-slate-900'}`}>
          {val === 0 ? 'Gratis' : val}
        </span>
      ),
    },
    {
      header: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Editar evento"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-brand hover:border-brand transition-colors"
          >
            <FiEdit3 size={13} />
          </button>
          <button
            type="button"
            title="Ver detalles"
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-brand hover:text-white transition-colors"
          >
            <FiEye size={13} />
          </button>
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
            Controla tu cartelera en tiempo real, supervisa la venta de aforo, configura estados y publica nuevas experiencias en Cartagena.
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

      {/* 2. KPIs y Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          label="Borradores"
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
        <StatCard
          label="Aforo Total Disponible"
          value={totalCapacity.toLocaleString('es-CO')}
          change="En todas las salas"
          trend="up"
          icon={FiUsers}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* 3. Barra de Filtros, Búsqueda y Switch de Vista (Grid vs Table) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todas</option>
              <option value="Música">Música</option>
              <option value="Gastronómico">Gastronómico</option>
              <option value="Académico">Académico</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Deportivo">Deportivo</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activos</option>
              <option value="Borrador">Borradores</option>
              <option value="Finalizado">Finalizados</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          {/* Buscador interno si no viene del header */}
          {!externalSearch && (
            <div className="relative flex-1 sm:w-60">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por título o lugar..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>
          )}

          {/* Toggle de Vista Accesible: Grid vs Table */}
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* 4. Renderizado Condicional: Vista en Tarjetas vs Vista en Tabla */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {paginatedGridEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedGridEvents.map((event) => (
                <OrganizerEventCard
                  key={event.id}
                  event={event}
                  onEdit={() => onCreate()}
                  onManage={() => alert(`Gestionando entradas y aforo para: ${event.title}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="font-display text-base font-bold text-slate-800">
                No se encontraron eventos con los filtros seleccionados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Prueba cambiando la categoría, el estado o limpiando el término de búsqueda.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory('Todos');
                  setStatusFilter('Todos');
                  setLocalSearch('');
                }}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}

          {/* Paginación para Grid */}
          {filteredEvents.length > pageSize && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12]}
              />
            </div>
          )}
        </div>
      ) : (
        /* Vista en Tabla con Paginación Integrada */
        <DataTable
          title="Listado Detallado de Eventos"
          subtitle={`Mostrando ${filteredEvents.length} eventos filtrados`}
          columns={eventTableColumns}
          data={filteredEvents}
          paginate={true}
          initialPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No se encontraron eventos"
          emptyDescription="Ajusta los filtros o agrega un nuevo evento a tu cartelera."
        />
      )}
    </div>
  );
}