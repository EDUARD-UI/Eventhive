import React, { useState, useMemo, useEffect } from 'react';
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiGrid,
  FiList,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
  FiLayers,
  FiAlertCircle,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';
import { getCategoryNames } from '../../services/categoryService.js';
import { formatHora12, formatFecha, formatHora24 } from '../../utils/formatters.js';
import Swal from 'sweetalert2';

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
  const [viewMode, setViewMode] = useState('posters'); // 'posters' | 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 9 para cuadrícula de 3x3, 10 para lista

  // Protección de operaciones asíncronas y doble clic
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      organizerService.getEventosOrganizador({ page: 0, size: 200 }),
      getCategoryNames(),
    ])
      .then(([eventsData, categoriesData]) => {
        if (!isMounted) return;
        const validEvents = (eventsData || []).filter(
          (e) =>
            (e.estado || '').toUpperCase() !== 'FINALIZADO' &&
            (e.rawStatus || '').toUpperCase() !== 'FINALIZADO'
        );
        const normalized = validEvents.map((e) => ({
          ...e,
          id: e.id,
          title: e.titulo || e.title || 'Sin título',
          category:
            typeof e.categoria === 'string'
              ? e.categoria
              : e.categoria?.nombre || e.nombreCategoria || 'Evento Cultural',
          date: e.fecha || e.date || 'Próximamente',
          time: formatHora12(e.hora || e.time) || 'Hora por confirmar',
          hora: formatHora12(e.hora || e.time) || 'Hora por confirmar',
          location: e.lugar || e.ubicacion || e.location || 'Cartagena',
          status: e.estado || 'BORRADOR',
          rawStatus: e.estado || 'BORRADOR',
          tone: toneMap[e.estado] || 'warning',
          photo: e.foto || e.imagen || null,
          localidades: Array.isArray(e.localidades) ? e.localidades : [],
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
      const matchesCategory =
        category === 'Todos' ||
        event.category === category ||
        (event.categoria &&
          (event.categoria === category || event.categoria?.nombre === category));
      const matchesStatus =
        statusFilter === 'Todos' ||
        event.rawStatus === statusFilter ||
        event.estado === statusFilter;
      const term = effectiveSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        event.title.toLowerCase().includes(term) ||
        (event.location && event.location.toLowerCase().includes(term)) ||
        event.category.toLowerCase().includes(term);

      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [organizerEvents, category, statusFilter, effectiveSearch]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [category, statusFilter, effectiveSearch, viewMode]);

  // Paginación en cliente
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Métricas calculadas dinámicamente
  const activeCount = organizerEvents.filter((e) => e.rawStatus === 'PUBLICADO').length;
  const draftCount = organizerEvents.filter(
    (e) => e.rawStatus === 'BORRADOR' || e.rawStatus === 'EN_CORRECCION'
  ).length;
  const finishedCount = organizerEvents.filter((e) => e.rawStatus === 'FINALIZADO').length;

  // Eliminar evento con protección de doble clic y feedback de loading
  const handleDelete = async (eventId, rawStatus) => {
    if (rawStatus === 'FINALIZADO') return;
    if (deletingId) return; // Evitar peticiones concurrentes

    const confirmRes = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar producción cultural?',
      text: 'Esta acción retirará permanentemente el evento de tu cartelera. ¿Deseas continuar?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
    });

    if (!confirmRes.isConfirmed) return;

    setDeletingId(eventId);
    try {
      await organizerService.eliminarEvento(eventId);
      setOrganizerEvents((prev) => prev.filter((e) => e.id !== eventId));
      Swal.fire({
        icon: 'success',
        title: 'Evento eliminado',
        text: 'La producción ha sido retirada correctamente.',
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al eliminar',
        text: err.message || 'No se pudo eliminar el evento en este momento.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Editorial con Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Cartelera de Producciones
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Gestión de Mis Eventos
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Supervisa tus carteles de eventos, controla el aforo de localidades y gestiona el ciclo de vida de tus publicaciones culturales.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <FiPlus size={16} />
          <span>Crear nuevo evento</span>
        </button>
      </div>

      {/* 2. KPIs de Cartelera */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Eventos Activos"
          value={String(activeCount)}
          change="En cartelera activa en Cartagena"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Eventos en Borrador"
          value={String(draftCount)}
          change="Pendientes de moderación"
          trend="neutral"
          icon={FiEdit3}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Eventos Finalizados"
          value={String(finishedCount)}
          change="Histórico completado"
          trend="neutral"
          icon={FiCalendar}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* 3. Barra de Filtros, Búsqueda y Selector de Vista */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro por Categoría */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Categoría:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todas las categorías</option>
              {categoryOptions.map((c) => (
                <option key={c.id || c.nombre} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="PUBLICADO">Publicados (Activos)</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_REVISION">En revisión</option>
              <option value="CANCELADO">Cancelados</option>
              <option value="SUSPENDIDO">Suspendidos</option>
              <option value="EN_CORRECCION">En corrección</option>
            </select>
          </div>

          {/* Botón para limpiar filtros */}
          {(category !== 'Todos' || statusFilter !== 'Todos' || effectiveSearch) && (
            <button
              type="button"
              onClick={() => {
                setCategory('Todos');
                setStatusFilter('Todos');
                setLocalSearch('');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX size={12} /> Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex items-center justify-between lg:justify-end gap-3">
          {/* Buscador interno */}
          {!externalSearch && (
            <div className="relative flex-1 sm:w-64">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por título o lugar..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
              />
            </div>
          )}

          {/* Selector de modo de vista: Cartelera vs Lista */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                setViewMode('posters');
                setPageSize(9);
              }}
              title="Vista Cartelera (Portadas)"
              aria-label="Vista Cartelera de Portadas"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'posters'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                setPageSize(10);
              }}
              title="Vista Lista Detallada"
              aria-label="Vista Lista Detallada"
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Contenido de Eventos */}
      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando producciones de tu organización...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto font-bold">
            <FiCalendar size={22} />
          </div>
          <div>
            <h4 className="font-display font-black text-sm text-slate-900">
              No se encontraron producciones
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
              {organizerEvents.length === 0
                ? 'Aún no tienes eventos registrados en tu organización. ¡Comienza publicando tu primera experiencia cultural!'
                : 'Ningún evento coincide con los filtros aplicados. Intenta ajustar la búsqueda o la categoría seleccionada.'}
            </p>
          </div>
          {organizerEvents.length === 0 ? (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B3D] text-amber-300 px-4 py-2 text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <FiPlus size={14} /> Crear primer evento
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCategory('Todos');
                setStatusFilter('Todos');
                setLocalSearch('');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      ) : viewMode === 'posters' ? (
        /* VISTA 1: CUADRÍCULA DE CARTELES / POSTERS DE EVENTOS */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedEvents.map((event) => {
              const isDeleting = deletingId === event.id;

              // Calcular aforo si hay localidades
              let totalCapacidad = 0;
              let totalVendidas = 0;
              if (Array.isArray(event.localidades)) {
                event.localidades.forEach((loc) => {
                  totalCapacidad += Number(loc.capacidad || 0);
                  totalVendidas += Math.max(0, (loc.capacidad || 0) - (loc.disponibles || 0));
                });
              }
              const pctVenta =
                totalCapacidad > 0 ? Math.round((totalVendidas / totalCapacidad) * 100) : 0;

              return (
                <article
                  key={event.id}
                  className="group rounded-3xl border border-slate-200/90 hover:border-amber-400 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Portada del Evento con badges */}
                  <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                    {event.photo ? (
                      <img
                        src={event.photo}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-slate-400 font-bold">
                        <FiCalendar size={32} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                    {/* Badge de Categoría */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
                        {event.category}
                      </span>
                    </div>

                    {/* Badge de Estado */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge tone={event.tone}>{event.status}</Badge>
                    </div>

                    {/* Fecha sobre la portada */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white text-xs">
                      <span className="font-bold flex items-center gap-1.5 drop-shadow-sm">
                        <FiClock size={12} className="text-amber-400" />
                        <span>{event.time}</span>
                      </span>
                      <span className="font-extrabold px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[11px]">
                        {event.date ? formatFecha(event.date) : 'Por confirmar'}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de Información */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-display font-black text-sm sm:text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-amber-700 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <FiMapPin size={12} className="text-amber-500 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </p>
                    </div>

                    {/* Indicador de Capacidad y Boletaje */}
                    {totalCapacidad > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                          <span className="flex items-center gap-1">
                            <FiLayers size={11} className="text-amber-500" />
                            <span>Aforo: {totalCapacidad} cupos</span>
                          </span>
                          <span className="text-amber-700 font-black">{pctVenta}% vendido</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, pctVenta)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra de Acciones */}
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetail && onViewDetail(event.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                    >
                      <FiEye size={13} className="text-slate-500" />
                      <span>Ver detalle</span>
                    </button>

                    {event.rawStatus !== 'FINALIZADO' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id, event.rawStatus)}
                        disabled={isDeleting || Boolean(deletingId)}
                        title="Eliminar evento"
                        aria-label={`Eliminar evento ${event.title}`}
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isDeleting ? (
                          <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginación */}
          {filteredEvents.length > pageSize && (
            <div className="pt-2 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          )}
        </div>
      ) : (
        /* VISTA 2: LISTA DETALLADA / TABLA EDITORIAL */
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Producción Cultural</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Fecha y Hora</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paginatedEvents.map((row) => {
                  const isDeleting = deletingId === row.id;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {row.photo ? (
                            <img
                              src={row.photo}
                              alt={row.title}
                              className="w-12 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                              <FiCalendar size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-display font-black text-slate-900 text-xs truncate">
                              {row.title}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <FiMapPin size={10} className="text-amber-500 shrink-0" />
                              <span className="truncate">{row.location}</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                          <FiTag size={10} className="text-amber-500" />
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-bold text-slate-800">
                          {row.date ? formatFecha(row.date) : 'Por confirmar'}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <FiClock size={10} />
                          <span>{row.time}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={row.tone}>{row.status}</Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => onViewDetail && onViewDetail(row.id)}
                            className="p-2 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Ver detalle del evento"
                          >
                            <FiEye size={15} />
                          </button>
                          {row.rawStatus !== 'FINALIZADO' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id, row.rawStatus)}
                              disabled={isDeleting || Boolean(deletingId)}
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Eliminar evento"
                            >
                              {isDeleting ? (
                                <span className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin inline-block" />
                              ) : (
                                <FiTrash2 size={15} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredEvents.length > pageSize && (
            <div className="p-4 border-t border-slate-100 bg-white flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
