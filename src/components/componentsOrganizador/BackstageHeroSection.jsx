import React, { useState, useEffect, useMemo } from 'react';
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiTag,
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiStar,
  FiTrendingUp,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';
import { formatFecha, formatHora12 } from '../../utils/formatters.js';

function getCountdownText(eventDate, eventTime) {
  if (!eventDate) return null;
  try {
    const cleanDate = String(eventDate).includes('T')
      ? eventDate.split('T')[0]
      : String(eventDate).trim();
    const timeStr = eventTime ? String(eventTime).trim() : '00:00:00';
    const target = new Date(`${cleanDate}T${timeStr}`);
    if (isNaN(target.getTime())) return null;

    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) {
      const isToday = target.toDateString() === now.toDateString();
      return isToday ? '¡Hoy en escena!' : null;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays === 0) {
      return diffHours > 0
        ? `En ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
        : 'Inicia en breve';
    }
    if (diffDays === 1) return 'Mañana';
    return `En ${diffDays} días`;
  } catch {
    return null;
  }
}

export default function BackstageHeroSection({
  publishedEvents = [],
  onSelectEvent,
  onCreateEvent,
  isLoading = false,
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedEventId, setSelectedEventId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Mapear eventos por fecha (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map = {};
    publishedEvents.forEach((ev) => {
      const rawDate = ev.fecha || ev.fechaInicio || ev.startsAt;
      if (!rawDate) return;
      const dateStr = String(rawDate).split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    });
    return map;
  }, [publishedEvents]);

  // Evento publicado más cercano por fecha (hoy o futuro, o el más próximo)
  const closestEvent = useMemo(() => {
    if (!publishedEvents.length) return null;
    const now = new Date().setHours(0, 0, 0, 0);

    const sorted = [...publishedEvents].sort((a, b) => {
      const dateA = new Date(a.fecha || a.startsAt || a.fechaInicio || 0).getTime();
      const dateB = new Date(b.fecha || b.startsAt || b.fechaInicio || 0).getTime();
      return dateA - dateB;
    });

    const future = sorted.find((e) => {
      const d = new Date(e.fecha || e.startsAt || e.fechaInicio || 0).getTime();
      return d >= now;
    });

    return future || sorted[sorted.length - 1];
  }, [publishedEvents]);

  // Selección automática al ingresar o cargar datos
  useEffect(() => {
    if (closestEvent && !selectedEventId) {
      setSelectedEventId(closestEvent.id);
      // Sincronizar el mes del calendario con el evento más cercano si tiene fecha válida
      const evDate = closestEvent.fecha || closestEvent.startsAt;
      if (evDate) {
        const d = new Date(String(evDate).split('T')[0] + 'T00:00:00');
        if (!isNaN(d.getTime())) {
          setCurrentDate(d);
        }
      }
    }
  }, [closestEvent, selectedEventId]);

  // Evento actualmente seleccionado
  const selectedEvent = useMemo(() => {
    if (!publishedEvents.length) return null;
    return publishedEvents.find((e) => e.id === selectedEventId) || closestEvent || publishedEvents[0];
  }, [publishedEvents, selectedEventId, closestEvent]);

  // Fecha clave del evento seleccionado para resaltado
  const selectedEventDateKey = useMemo(() => {
    if (!selectedEvent) return null;
    const raw = selectedEvent.fecha || selectedEvent.startsAt;
    return raw ? String(raw).split('T')[0] : null;
  }, [selectedEvent]);

  // Fecha actualmente seleccionada en el calendario
  const [activeCalendarDateKey, setActiveCalendarDateKey] = useState(null);

  useEffect(() => {
    if (selectedEventDateKey && !activeCalendarDateKey) {
      setActiveCalendarDateKey(selectedEventDateKey);
    }
  }, [selectedEventDateKey, activeCalendarDateKey]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dateKey) => {
    setActiveCalendarDateKey(dateKey);
    const dayEvs = eventsByDate[dateKey] || [];
    if (dayEvs.length > 0) {
      setSelectedEventId(dayEvs[0].id);
    }
    // Si no hay eventos en ese día, se conserva la selección actual (Regla de negocio)
  };

  const activeDayEvents = eventsByDate[activeCalendarDateKey] || [];

  // Cálculo real de boletería si el evento dispone de localidades
  const ticketStats = useMemo(() => {
    if (!selectedEvent || !Array.isArray(selectedEvent.localidades) || selectedEvent.localidades.length === 0) {
      return null;
    }
    let totalCap = 0;
    let totalDisp = 0;
    selectedEvent.localidades.forEach((l) => {
      const cap = Number(l.capacidad || 0);
      const disp = Number(l.disponibles ?? l.cupos ?? cap);
      totalCap += cap;
      totalDisp += disp;
    });
    if (totalCap === 0) return null;
    const sold = Math.max(0, totalCap - totalDisp);
    const pct = Math.round((sold / totalCap) * 100);
    return { sold, totalCap, pct };
  }, [selectedEvent]);

  const countdown = selectedEvent ? getCountdownText(selectedEvent.fecha, selectedEvent.hora) : null;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs animate-pulse space-y-4">
          <div className="h-64 sm:h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs animate-pulse">
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-md mb-4" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* =========================================================================
          COLUMNA IZQUIERDA: EVENTO PROTAGONISTA EN ESCENA
         ========================================================================= */}
      <div className="lg:col-span-7 flex flex-col">
        {selectedEvent ? (
          <div className="flex-1 bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
            {/* Contenedor Fotográfico Cinematográfico */}
            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[340px] overflow-hidden bg-slate-950">
              {selectedEvent.foto || selectedEvent.imagen || selectedEvent.photo ? (
                <img
                  src={selectedEvent.foto || selectedEvent.imagen || selectedEvent.photo}
                  alt={selectedEvent.titulo}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#0B1B3D] to-slate-950 text-amber-400">
                  <FiCalendar size={48} className="opacity-40" />
                </div>
              )}

              {/* Degradado para legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent pointer-events-none" />

              {/* Badges superiores sobre imagen */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 pointer-events-none">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/95 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <FiCheckCircle size={11} /> Publicado
                  </span>
                  {(selectedEvent.promocionado || selectedEvent.destacado) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <FiStar size={11} className="fill-current" /> Destacado
                    </span>
                  )}
                  {selectedEvent.categoria?.nombre && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-white/10 text-[10px] font-bold">
                      <FiTag size={10} className="text-amber-400" />
                      {selectedEvent.categoria.nombre}
                    </span>
                  )}
                </div>

                {countdown && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-xs text-amber-300 border border-amber-400/30 text-[11px] font-black tracking-wide shadow-md">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {countdown}
                  </span>
                )}
              </div>

              {/* Título y micro-metadatos sobre la base de la imagen */}
              <div className="absolute bottom-4 inset-x-4 pointer-events-none">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block mb-0.5">
                  Producción Protagonista
                </span>
                <h3 className="font-display text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                  {selectedEvent.titulo}
                </h3>
              </div>
            </div>

            {/* Fila de Metadatos y Acción de Administración */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Fecha */}
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FiCalendar size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Fecha</span>
                    <span className="font-bold truncate block">
                      {selectedEvent.fecha ? formatFecha(selectedEvent.fecha) : 'Por definir'}
                    </span>
                  </div>
                </div>

                {/* Hora */}
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FiClock size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Hora</span>
                    <span className="font-bold truncate block">
                      {selectedEvent.hora ? formatHora12(selectedEvent.hora) : 'Por definir'}
                    </span>
                  </div>
                </div>

                {/* Lugar */}
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FiMapPin size={14} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Lugar</span>
                    <span className="font-bold truncate block" title={selectedEvent.lugar}>
                      {selectedEvent.lugar || 'Cartagena'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resumen real de ventas de boletería si está disponible */}
              {ticketStats && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070D1B] border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FiLayers size={14} className="text-amber-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Boletería:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">
                      {ticketStats.sold.toLocaleString('es-CO')} de {ticketStats.totalCap.toLocaleString('es-CO')} boletas
                    </strong>
                  </div>
                  <span className="font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-700/40 text-[11px]">
                    {ticketStats.pct}% ocupación
                  </span>
                </div>
              )}

              {/* Botón CTA de administración del evento */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Accede a métricas de tickets, asistentes y control de acceso.
                </span>
                <button
                  type="button"
                  onClick={() => onSelectEvent && onSelectEvent(selectedEvent.id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 text-amber-300 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer ml-auto"
                >
                  <span>Administrar producción</span>
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State con microcopy del concepto Backstage */
          <div className="flex-1 bg-white dark:bg-[#0E1626] rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center border border-amber-200 dark:border-amber-700/40">
              <FiCalendar size={28} />
            </div>
            <div className="max-w-md space-y-1">
              <h3 className="font-display text-lg font-black text-slate-900 dark:text-white">
                El escenario está vacío
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Es hora de preparar el próximo gran evento de tu organización. Publica tu producción para habilitar venta de entradas, visibilidad y control de acceso.
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateEvent}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <FiPlus size={14} />
              <span>Preparar nuevo evento</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          COLUMNA DERECHA: CALENDARIO VISUAL DE PRODUCCIÓN
         ========================================================================= */}
      <div className="lg:col-span-5 bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
        {/* Cabecera del Calendario */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <FiCalendar size={16} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Agenda de Cartelera
              </span>
              <h4 className="font-display text-base font-black text-slate-900 dark:text-white leading-tight">
                {monthNames[month]} {year}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Mes anterior"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Mes siguiente"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Días de la Semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
          {daysOfWeek.map((d, i) => (
            <div key={i} className="py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Días del Mes */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div
              key={`prev-${i}`}
              className="h-9 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-700 select-none"
            >
              {prevMonthDays - firstDayIndex + i + 1}
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;

            const dayEvents = eventsByDate[dateKey] || [];
            const hasEvents = dayEvents.length > 0;
            const isDaySelected = activeCalendarDateKey === dateKey;
            const isEventDate = selectedEventDateKey === dateKey;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleSelectDay(dateKey)}
                className={`h-9 w-full rounded-xl text-xs font-bold flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                  isDaySelected || isEventDate
                    ? 'bg-[#0B1B3D] text-amber-300 shadow-sm ring-2 ring-amber-400/40 font-black'
                    : hasEvents
                    ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-950 dark:text-amber-300 font-black hover:bg-amber-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={hasEvents ? `${dayEvents.length} producción(es) programada(s)` : dateKey}
              >
                <span>{dayNum}</span>
                {hasEvents && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                      isDaySelected || isEventDate ? 'bg-amber-400' : 'bg-amber-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selector de Eventos del Día si hay múltiples */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-extrabold text-slate-400 uppercase tracking-wider">
              {activeCalendarDateKey ? formatFecha(activeCalendarDateKey) : 'Selecciona un día'}
            </span>
            {activeDayEvents.length > 0 && (
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                {activeDayEvents.length} {activeDayEvents.length === 1 ? 'evento' : 'eventos'}
              </span>
            )}
          </div>

          {activeDayEvents.length === 0 ? (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070D1B] border border-dashed border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Sin novedades en esta fecha. Selecciona un día marcado para enfocar la producción.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {activeDayEvents.map((ev) => {
                const isCurrent = ev.id === selectedEventId;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/15 text-slate-900 dark:text-white font-extrabold shadow-2xs'
                        : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0B1428] hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{ev.titulo}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <FiClock size={10} className="text-amber-500" />
                        <span>{ev.hora ? formatHora12(ev.hora) : 'Hora por confirmar'}</span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isCurrent ? 'En escena' : 'Ver'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
