import React, { useState, useEffect, useCallback, useMemo } from 'react';
import StandardLayout from '../../layouts/StandardLayout.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

import CreateEventWizard from '../../components/componentsOrganizador/CreateEventWizard.jsx';
import MiEvento from './MiEvento.jsx';
import EntradasView from './EntradasView.jsx';
import PerfilOrganizador from './PerfilOrganizador.jsx';
import EventDetailView from './EventDetailView.jsx';
import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiGrid,
  FiPlus,
  FiTag,
  FiUser,
  FiX,
  FiArrowRight,
  FiEye,
  FiLayers,
  FiTrendingUp,
  FiClock,
  FiMapPin,
  FiDollarSign,
  FiActivity,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { session } from '../../services/session.js';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
];

/**
 * Calendario interactivo basado en la Imagen 2:
 * Muestra el mes actual con días de la semana y resalta con un círculo los días
 * que tienen eventos agendados para la organización autenticada.
 */
function OrgEventsCalendar({ events = [], onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Agrupar eventos por día formato YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const rawDate = ev.fecha || ev.fechaEvento || ev.startsAt || ev.fechaInicio;
      if (!rawDate) return;
      const dateKey = String(rawDate).slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(ev);
    });
    return map;
  }, [events]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Fecha seleccionada para listar eventos debajo del calendario
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Eventos para el día seleccionado
  const selectedDayEvents = eventsByDate[selectedDayKey] || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* Encabezado Calendario */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Agenda Mensual
          </span>
          <h3 className="font-display text-base font-bold text-slate-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Mes anterior"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="Mes siguiente"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
        {daysOfWeek.map((d, i) => (
          <div key={i} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Días del Mes */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Días mes anterior */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`prev-${i}`}
            className="h-8 flex items-center justify-center text-[11px] text-slate-300 select-none"
          >
            {prevMonthDays - firstDayIndex + i + 1}
          </div>
        ))}

        {/* Días mes actual */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const monthStr = String(month + 1).padStart(2, '0');
          const dayStr = String(dayNum).padStart(2, '0');
          const dateKey = `${year}-${monthStr}-${dayStr}`;

          const dayEvents = eventsByDate[dateKey] || [];
          const hasEvents = dayEvents.length > 0;
          const isSelected = selectedDayKey === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDayKey(dateKey)}
              className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center text-xs font-semibold transition-all relative ${
                isSelected
                  ? 'bg-[#0B1B3D] text-white shadow-xs font-bold'
                  : hasEvents
                  ? 'bg-amber-100 text-amber-950 font-bold hover:bg-amber-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{dayNum}</span>
              {hasEvents && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Leyenda y Eventos del día seleccionado (Guía Imagen 2) */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-bold text-slate-800">
            Agenda del día ({selectedDayKey}):
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {selectedDayEvents.length}{' '}
            {selectedDayEvents.length === 1 ? 'evento' : 'eventos'}
          </span>
        </div>

        {selectedDayEvents.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 text-center bg-slate-50 rounded-xl">
            Sin eventos agendados para este día
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent && onSelectEvent(ev.id)}
                className="p-2.5 rounded-xl border border-amber-200/60 bg-amber-50/40 hover:bg-amber-100/60 transition-colors cursor-pointer flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {ev.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <FiClock size={10} className="text-amber-600" />
                    <span>{ev.hora ? String(ev.hora).slice(0, 5) : 'Hora por confirmar'}</span>
                    <span>•</span>
                    <span className="truncate">{ev.lugar || 'Ubicación registrada'}</span>
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-brand hover:text-brand-dark shrink-0"
                >
                  <FiArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizadorIndex() {
  const [activeItem, setActiveItem] = useState('resumen');
  const [creationView, setCreationView] = useState(null);
  const [notification, setNotification] = useState(false);
  const [orgData, setOrgData] = useState(null);

  // Lista completa de eventos de la organización
  const [allOrgEvents, setAllOrgEvents] = useState([]);

  // Resumen stats from backend
  const [stats, setStats] = useState({
    eventosActivos: 0,
    entradasVendidas: 0,
    totalEventos: 0,
    totalRecaudo: 0,
  });

  // Cartelera — paginated from backend
  const [carteleraEvents, setCarteleraEvents] = useState([]);
  const [carteleraPage, setCarteleraPage] = useState(0);
  const [carteleraTotal, setCarteleraTotal] = useState(0);
  const carteleraPageSize = 5;

  // Event detail view (internal navigation, not sidebar)
  const [selectedEventId, setSelectedEventId] = useState(null);

  const fetchCarteleraPage = useCallback(async (page) => {
    try {
      const data = await organizerService.getEventosOrganizadorPaginated({
        page,
        size: carteleraPageSize,
      });
      setCarteleraEvents(data?.content || []);
      setCarteleraTotal(data?.totalElements || 0);
      setCarteleraPage(page);
    } catch {
      setCarteleraEvents([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Fetch org data
    organizerService.getMiOrganizacion()
      .then((data) => {
        if (isMounted && data) setOrgData(data);
      })
      .catch(() => {});

    // Fetch summary stats from backend events
    organizerService.getEventosOrganizador({ page: 0, size: 200 })
      .then((events) => {
        if (!isMounted) return;
        const list = events || [];
        setAllOrgEvents(list);

        const activos = list.filter((e) => e.estado === 'PUBLICADO').length;
        let vendidas = 0;
        let recaudo = 0;

        list.forEach((e) => {
          if (e.localidades) {
            e.localidades.forEach((loc) => {
              const vendidosLoc = Math.max(0, (loc.capacidad || 0) - (loc.disponibles || 0));
              vendidas += vendidosLoc;
              recaudo += vendidosLoc * (loc.precio || 0);
            });
          }
        });

        setStats({
          eventosActivos: activos,
          entradasVendidas: vendidas,
          totalEventos: list.length,
          totalRecaudo: recaudo,
        });
      })
      .catch(() => {});

    // Fetch cartelera first page
    fetchCarteleraPage(0);

    return () => {
      isMounted = false;
    };
  }, [fetchCarteleraPage]);

  const orgName = orgData?.nombre || orgData?.razonSocial || session.getUser()?.name || 'Mi Organización';
  const representativeName = orgData?.representante || session.getUser()?.name || 'Representante';

  const activeMenu = menuItems.find((m) => m.id === activeItem);

  const showSuccess = () => {
    setCreationView(null);
    setActiveItem('eventos');
    setNotification(true);
  };

  const returnToEvents = () => {
    setCreationView(null);
    setActiveItem('eventos');
    setNotification(false);
  };

  // Cartelera columns
  const carteleraColumns = [
    {
      header: 'Evento',
      key: 'titulo',
      render: (val) => (
        <span className="font-display font-bold text-slate-900 text-xs">
          {val}
        </span>
      ),
    },
    {
      header: 'Categoría',
      key: 'categoria',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
          <FiTag size={10} className="text-slate-400" />
          {row.categoria?.nombre || 'Sin categoría'}
        </span>
      ),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (val) => {
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
        return <Badge tone={toneMap[val] || 'neutral'}>{labelMap[val] || val}</Badge>;
      },
    },
    {
      header: 'Acción',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedEventId(row.id)}
          className="text-xs font-bold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
        >
          <FiEye size={12} /> Ver detalle
        </button>
      ),
    },
  ];

  const renderContent = () => {
    // Event detail view — internal navigation
    if (selectedEventId) {
      return (
        <EventDetailView
          eventId={selectedEventId}
          onBack={() => setSelectedEventId(null)}
          onEdit={() => {}}
        />
      );
    }

    if (creationView === 'wizard') {
      return <CreateEventWizard onBack={returnToEvents} onSave={showSuccess} />;
    }

    switch (activeItem) {
      case 'resumen':
        return (
          <div className="space-y-6">
            {/* Grid Superior: Banner Amarillo / Cálido (Guía Imagen 2) + Widgets Laterales de Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
              
              {/* Banner Amarillo Cálido Estilo "Hello Sarah!" de Imagen 2 adaptado al Home */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 p-6 sm:p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px] border border-amber-300/80">
                <div className="max-w-md relative z-10 space-y-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-950/80 bg-white/60 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
                    Panel de Gestión
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    ¡Hola, {representativeName}!
                  </h2>
                  <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                    Gestiona los eventos culturales de {orgName}, supervisa el aforo emitido y consulta las fechas agendadas en tu calendario.
                  </p>
                </div>

                <div className="mt-5 relative z-10 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCreationView('wizard')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0B1B3D] hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    <FiPlus size={15} />
                    <span>Crear nuevo evento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveItem('eventos')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-900 font-bold text-xs transition-all cursor-pointer"
                  >
                    <span>Ver mis eventos</span>
                    <FiArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Tarjetas KPI Verticales Inspiradas en Admin y la Columna Derecha de la Imagen 2 */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-brand">
                      <FiCalendar size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Eventos Activos
                      </span>
                      <strong className="text-lg font-black text-slate-900">
                        {stats.eventosActivos}
                      </strong>
                    </div>
                  </div>
                  <Badge tone={stats.eventosActivos > 0 ? 'active' : 'neutral'}>
                    {stats.eventosActivos > 0 ? 'En cartelera' : '0 activos'}
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <FiCreditCard size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Entradas Vendidas
                      </span>
                      <strong className="text-lg font-black text-slate-900">
                        {stats.entradasVendidas.toLocaleString('es-CO')}
                      </strong>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600">
                    Emitidas
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                      <FiLayers size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Registrados
                      </span>
                      <strong className="text-lg font-black text-slate-900">
                        {stats.totalEventos}
                      </strong>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Histórico
                  </span>
                </div>
              </div>
            </div>

            {/* Layout Inferior en 2 columnas: Lista de Eventos (Top Articles de Imagen 2) + Calendario (Today's Article) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              
              {/* Cartelera / Lista de Eventos */}
              <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-black text-slate-900">
                      Eventos de la Organización
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Control y estado de tus publicaciones culturales
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveItem('eventos')}
                    className="text-xs font-bold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    Ver todos <FiArrowRight size={11} />
                  </button>
                </div>

                <DataTable
                  columns={carteleraColumns}
                  data={carteleraEvents}
                  paginate={false}
                  emptyMessage="No tienes eventos registrados"
                  emptyDescription="Publica tu primer evento para verlo aquí."
                />

                {carteleraTotal > carteleraPageSize && (
                  <Pagination
                    currentPage={carteleraPage + 1}
                    totalItems={carteleraTotal}
                    pageSize={carteleraPageSize}
                    onPageChange={(p) => fetchCarteleraPage(p - 1)}
                    pageSizeOptions={[5]}
                  />
                )}
              </div>

              {/* Calendario con Eventos Agendados (Guía Imagen 2) */}
              <OrgEventsCalendar
                events={allOrgEvents}
                onSelectEvent={(id) => setSelectedEventId(id)}
              />
            </div>
          </div>
        );
      case 'eventos':
        return (
          <MiEvento
            onCreate={() => setCreationView('wizard')}
            onViewDetail={(eventId) => setSelectedEventId(eventId)}
          />
        );
      case 'entradas':
        return <EntradasView />;
      case 'perfil':
        return <PerfilOrganizador />;
      default:
        return (
          <section className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white text-center p-8 shadow-sm">
            <div className="mb-4 rounded-2xl bg-brand-light p-4 text-brand">
              <FiPlus size={26} />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Sección en desarrollo
            </h2>
            <p className="mt-2 text-xs text-slate-500 max-w-md">
              Esta vista quedará conectada a los servicios backend cuando se configure el módulo.
            </p>
          </section>
        );
    }
  };

  return (
    <StandardLayout
      role="Organización"
      menuItems={menuItems}
      activeItem={activeItem}
      onSelect={(item) => {
        setActiveItem(item);
        setCreationView(null);
        setNotification(false);
        setSelectedEventId(null);
      }}
      headerProps={{
        title: activeMenu ? activeMenu.label : 'Panel de la Organización',
        showSearch: false,
        showNotifications: true,
        userName: orgName,
        userInitials: orgName.slice(0, 2).toUpperCase(),
        onProfileClick: () => setActiveItem('perfil'),
      }}
      maxWidthClass="max-w-[1280px]"
    >
      {notification && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3.5 shadow-sm animate-fade-in">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
            <FiCheck size={14} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-900">
              Evento creado exitosamente
            </p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Tu evento fue guardado correctamente y ya se encuentra visible en tu cartelera.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => setNotification(false)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      {renderContent()}
    </StandardLayout>
  );
}
