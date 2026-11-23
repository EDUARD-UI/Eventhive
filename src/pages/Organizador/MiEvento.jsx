import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiClock,
} from 'react-icons/fi';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';
import { getCategoryNames } from '../../services/categoryService.js';
import { formatHora12, formatFecha } from '../../utils/formatters.js';
import Swal from 'sweetalert2';

const normalizeOrganizerEvent = (e) => ({
  ...e,
  id: e.id || e.eventoId,
  eventoId: e.id || e.eventoId,
  title: e.titulo || e.nombre || e.title || 'Sin título',
  titulo: e.titulo || e.nombre || e.title || 'Sin título',
  category:
    typeof e.categoria === 'string'
      ? e.categoria
      : e.categoria?.nombre || e.nombreCategoria || e.categoriaNombre || 'General',
  date: e.fecha || e.date || 'Próximamente',
  fecha: e.fecha || e.date || 'Próximamente',
  time: formatHora12(e.hora || e.time) || '',
  hora: formatHora12(e.hora || e.time) || '',
  location: e.lugar || e.ubicacion || e.location || 'Cartagena',
  lugar: e.lugar || e.ubicacion || e.location || 'Cartagena',
  status: e.estado || e.rawStatus || 'BORRADOR',
  rawStatus: e.estado || e.rawStatus || 'BORRADOR',
  estado: e.estado || e.rawStatus || 'BORRADOR',
  photo: e.foto || e.imagen || e.imagenUrl || null,
  localidades: Array.isArray(e.localidades) ? e.localidades : [],
});

function formatPosterMeta(dateStr, timeStr) {
  if (!dateStr) return 'POR CONFIRMAR';
  try {
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const monthName = months[parseInt(month, 10) - 1] || 'MES';
      const timeClean = timeStr ? ` • ${timeStr}` : '';
      return `${parseInt(day, 10)} ${monthName} ${year}${timeClean}`;
    }
  } catch {}
  return `${dateStr}${timeStr ? ` • ${timeStr}` : ''}`;
}

export default function MiEvento({
  onCreate,
  onViewDetail,
  externalSearch = '',
  initialEvents = null,
  refreshTrigger = 0,
}) {
  const [organizerEvents, setOrganizerEvents] = useState(() => {
    if (Array.isArray(initialEvents) && initialEvents.length > 0) {
      return initialEvents.map(normalizeOrganizerEvent);
    }
    return [];
  });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(
    () => !(Array.isArray(initialEvents) && initialEvents.length > 0)
  );
  const [category, setCategory] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('todos'); // 'todos' | 'en_venta' | 'borradores' | 'archivo'
  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Grid 2x3 o 3x2 en el 75%
  const [deletingId, setDeletingId] = useState(null);

  // Estado del calendario de gira (Agenda de Gira)
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [eventsData, categoriesData] = await Promise.all([
        organizerService.getEventosOrganizador({ page: 0, size: 50 }),
        getCategoryNames(),
      ]);
      const validEvents = (eventsData || []).filter(
        (e) =>
          (e.estado || '').toUpperCase() !== 'FINALIZADO' &&
          (e.rawStatus || '').toUpperCase() !== 'FINALIZADO'
      );
      setOrganizerEvents(validEvents.map(normalizeOrganizerEvent));
      if (categoriesData) setCategoryOptions(categoriesData);
    } catch (err) {
      console.error('Error cargando eventos del organizador:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(Boolean(initialEvents && initialEvents.length > 0));
  }, [fetchEvents, refreshTrigger]);

  useEffect(() => {
    if (Array.isArray(initialEvents) && initialEvents.length > 0) {
      setOrganizerEvents(initialEvents.map(normalizeOrganizerEvent));
      setLoading(false);
    }
  }, [initialEvents]);

  useEffect(() => {
    const handleEventsUpdated = (e) => {
      const saved = e.detail;
      if (saved && (saved.id || saved.eventoId)) {
        const norm = normalizeOrganizerEvent(saved);
        setOrganizerEvents((prev) => {
          const index = prev.findIndex((item) => String(item.id) === String(norm.id));
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...norm };
            return next;
          }
          return [norm, ...prev];
        });
      }
      fetchEvents(true);
    };

    window.addEventListener('eventhive:events_updated', handleEventsUpdated);
    return () => window.removeEventListener('eventhive:events_updated', handleEventsUpdated);
  }, [fetchEvents]);

  const effectiveSearch = externalSearch || localSearch;

  // Filtrado de eventos
  const filteredEvents = useMemo(() => {
    return organizerEvents.filter((event) => {
      const matchesCategory =
        category === 'Todos' ||
        event.category?.toLowerCase() === category.toLowerCase();

      const st = String(event.status || event.rawStatus || '').toUpperCase();
      let matchesStatus = true;
      if (statusFilter === 'en_venta') matchesStatus = st === 'PUBLICADO';
      else if (statusFilter === 'borradores') matchesStatus = st === 'BORRADOR' || st === 'EN_CORRECCION' || st === 'PENDIENTE_REVISION';
      else if (statusFilter === 'archivo') matchesStatus = st === 'FINALIZADO' || st === 'CANCELADO' || st === 'SUSPENDIDO';

      const matchesSearch =
        !effectiveSearch ||
        event.title.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
        event.location.toLowerCase().includes(effectiveSearch.toLowerCase());

      let matchesDate = true;
      if (selectedCalendarDate) {
        const evDate = String(event.date || '').split('T')[0];
        matchesDate = evDate === selectedCalendarDate;
      }

      return matchesCategory && matchesStatus && matchesSearch && matchesDate;
    });
  }, [organizerEvents, category, statusFilter, effectiveSearch, selectedCalendarDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, statusFilter, effectiveSearch, selectedCalendarDate]);

  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  // Mapa de eventos por fecha para el calendario
  const eventsByDate = useMemo(() => {
    const map = {};
    organizerEvents.forEach((ev) => {
      const rawDate = ev.date || ev.fecha;
      if (!rawDate) return;
      const dateStr = String(rawDate).split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    });
    return map;
  }, [organizerEvents]);

  // Datos del mes del calendario
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Domingo
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDelete = async (eventId, rawStatus) => {
    if (rawStatus === 'FINALIZADO') return;
    if (deletingId) return;

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
    <div className="space-y-8 select-none">
      {/* 1. Cabecera Minimalista: Título, Filtros Tipográficos y Botón Primario */}
      <div className="border-b border-[#E2E8F0] pb-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.5rem)] text-[#0F2342] tracking-tight uppercase leading-none">
              Cartelera Completa
            </h1>
          </div>

          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-[#FFFFFF] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer shadow-xs active:scale-98 shrink-0"
          >
            <FiPlus size={14} strokeWidth={2.5} />
            <span>Nuevo Evento</span>
          </button>
        </div>

        {/* Filtros tipográficos y buscador */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          {/* Tabs con subrayado de 2px en #F5B800 */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'en_venta', label: 'En Venta' },
              { id: 'borradores', label: 'Borradores' },
              { id: 'archivo', label: 'Archivo' },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`font-mono text-xs uppercase tracking-wider transition-all cursor-pointer pb-2 relative shrink-0 ${
                    isActive
                      ? 'text-[#0F2342] font-bold'
                      : 'text-[#64748B] hover:text-[#0F2342] font-medium'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-[#F5B800] transition-all"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Buscador interno limpio */}
          <div className="relative w-full md:w-64 shrink-0">
            <FiSearch
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="BUSCAR POR NOMBRE O LUGAR..."
              className="w-full rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] py-2 pl-8 pr-3 font-mono text-[11px] text-[#0F2342] placeholder:text-[#94A3B8] uppercase outline-none focus:border-[#0F2342] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Layout Asimétrico: 75% Grilla de Pósters + 25% Agenda de Gira (Tour Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* =========================================================================
            COLUMNA IZQUIERDA (~75% del ancho): Grilla de Pósters a Todo Color
           ========================================================================= */}
        <section className="lg:col-span-8 xl:col-span-9 w-full space-y-6">
          {selectedCalendarDate && (
            <div className="flex items-center justify-between p-3 bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] text-xs font-mono">
              <span className="text-[#64748B]">
                Filtrando producciones del <strong className="text-[#0F2342]">{selectedCalendarDate}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="text-[#B45309] hover:underline font-bold cursor-pointer"
              >
                Ver todas las fechas
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] animate-pulse overflow-hidden">
                  <div className="aspect-[4/5] bg-[#F1F5F9]" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-[#E2E8F0] w-1/2 rounded-[1px]" />
                    <div className="h-4 bg-[#E2E8F0] w-3/4 rounded-[1px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] p-12 text-center space-y-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#64748B] block">
                Escenario en Silencio
              </span>
              <h3 className="font-display font-black text-xl text-[#0F2342] uppercase tracking-tight">
                No hay producciones registradas
              </h3>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                No se encontraron eventos con los filtros aplicados.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
                >
                  <FiPlus size={13} />
                  <span>Crear Producción</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => {
                const isDeleting = deletingId === event.id;
                const posterDate = formatPosterMeta(event.date, event.time);

                return (
                  <article
                    key={event.id}
                    className="group rounded-[2px] border border-[#E2E8F0] hover:border-[#0F2342] bg-[#FFFFFF] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                  >
                    {/* Póster a Todo Color Natural sin Badges ni Pills Flotantes */}
                    <div
                      className="relative aspect-[4/5] bg-[#F8F9FA] overflow-hidden cursor-pointer"
                      onClick={() => onViewDetail && onViewDetail(event.id)}
                    >
                      {event.photo ? (
                        <img
                          src={event.photo}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0F2342] text-white p-4">
                          <span className="font-mono text-xs uppercase tracking-widest text-[#F5B800]">PÓSTER</span>
                          <span className="font-display font-black text-2xl mt-2 text-center line-clamp-2">
                            {event.title}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ficha Editorial Inferior sobre Fondo Blanco Limpio */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-[#FFFFFF]">
                      <div>
                        {/* Fecha en Monospace 11px */}
                        <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B] block truncate">
                          {posterDate}
                        </span>

                        {/* Título en Tipografía Display */}
                        <h3
                          onClick={() => onViewDetail && onViewDetail(event.id)}
                          className="font-display font-black text-base sm:text-lg text-[#0F2342] uppercase tracking-tight leading-tight line-clamp-2 mt-1 cursor-pointer group-hover:text-[#B45309] transition-colors"
                        >
                          {event.title}
                        </h3>

                        {/* Recinto / Ubicación */}
                        <p className="text-xs text-[#64748B] mt-1 truncate">
                          {event.location}
                        </p>
                      </div>

                      {/* Filete Divisor Fino de 1px con Acciones Tipográficas */}
                      <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => onViewDetail && onViewDetail(event.id)}
                          className="font-mono text-xs font-bold text-[#0F2342] hover:text-[#B45309] border-b border-transparent hover:border-[#F5B800] transition-all cursor-pointer py-0.5"
                        >
                          Ver detalle →
                        </button>

                        {event.rawStatus !== 'FINALIZADO' && (
                          <button
                            type="button"
                            onClick={() => handleDelete(event.id, event.rawStatus)}
                            disabled={isDeleting || Boolean(deletingId)}
                            title="Eliminar producción"
                            className="text-[#94A3B8] hover:text-rose-600 font-mono text-[11px] transition-colors cursor-pointer disabled:opacity-40"
                          >
                            {isDeleting ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {filteredEvents.length > pageSize && (
            <div className="pt-4 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredEvents.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                showPageSize={false}
              />
            </div>
          )}
        </section>

        {/* =========================================================================
            COLUMNA DERECHA (~25% del ancho): Agenda de Gira (Tour Calendar)
           ========================================================================= */}
        <aside className="lg:col-span-4 xl:col-span-3 w-full space-y-6 lg:sticky lg:top-24">
          <div className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-5 space-y-5">
            {/* Cabecera del Calendario */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#64748B] block">
                  AGENDA DE GIRA
                </span>
                <h4 className="font-display font-black text-base text-[#0F2342] uppercase tracking-tight mt-0.5">
                  {monthNames[calMonth]} {calYear}
                </h4>
              </div>

              {/* Controles de Navegación del Mes */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Mes anterior"
                  className="p-1 rounded-[2px] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  <FiChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Mes siguiente"
                  className="p-1 rounded-[2px] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Días de la Semana */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                <div key={i} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Grilla de Días del Mes */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
              {/* Espacios vacíos antes del primer día */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Días del mes */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayString = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const hasEvent = Boolean(eventsByDate[dayString]?.length);
                const isSelected = selectedCalendarDate === dayString;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => {
                      if (hasEvent) {
                        setSelectedCalendarDate(isSelected ? null : dayString);
                      }
                    }}
                    disabled={!hasEvent}
                    className={`h-8 rounded-[2px] flex flex-col items-center justify-center transition-all relative ${
                      hasEvent ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'bg-[#F5B800] text-[#0F2342] font-bold shadow-xs'
                        : hasEvent
                        ? 'bg-[#0F2342] text-white font-bold hover:bg-[#1E293B]'
                        : 'text-[#64748B] hover:bg-slate-50'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {hasEvent && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#F5B800] mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Lista de Próximas Fechas en la Agenda */}
            <div className="border-t border-[#E2E8F0] pt-4 space-y-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B] block">
                Próximas Fechas
              </span>

              {organizerEvents.slice(0, 4).map((ev) => {
                const rawDate = ev.date || ev.fecha;
                let day = '—';
                let month = 'MES';
                try {
                  const parts = String(rawDate).split('T')[0].split('-');
                  if (parts.length === 3) {
                    day = parseInt(parts[2], 10);
                    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                    month = months[parseInt(parts[1], 10) - 1] || 'MES';
                  }
                } catch {}

                return (
                  <div
                    key={ev.id}
                    onClick={() => onViewDetail && onViewDetail(ev.id)}
                    className="flex items-center gap-3 p-2 rounded-[2px] hover:bg-[#F8F9FA] transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-[2px] bg-[#F1F5F9] border border-[#E2E8F0] flex flex-col items-center justify-center shrink-0">
                      <span className="font-display font-black text-xs text-[#0F2342] leading-none">
                        {day}
                      </span>
                      <span className="font-mono text-[8px] text-[#64748B] uppercase">
                        {month}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-bold text-xs text-[#0F2342] group-hover:text-[#B45309] truncate uppercase">
                        {ev.title}
                      </p>
                      <p className="font-mono text-[10px] text-[#64748B] truncate">
                        {ev.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
