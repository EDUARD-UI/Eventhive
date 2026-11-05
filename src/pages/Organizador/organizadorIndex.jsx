import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StandardLayout from '../../layouts/StandardLayout.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

import CreateEventWizard from '../../components/componentsOrganizador/CreateEventWizard.jsx';
import MiEvento from './MiEvento.jsx';
import OperadoresView from './OperadoresView.jsx';
import PosicionamientoView from './PosicionamientoView.jsx';
import EntradasView from './EntradasView.jsx';
import PerfilOrganizador from './PerfilOrganizador.jsx';
import EventDetailView from './EventDetailView.jsx';
import { formatHora12, formatFecha } from '../../utils/formatters.js';
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
  FiUsers,
  FiX,
  FiArrowRight,
  FiEye,
  FiClock,
  FiDollarSign,
  FiAward,
  FiStar,
  FiActivity,
  FiShield,
  FiAlertCircle,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { session } from '../../services/session.js';
import { formatPrice } from '../../utils/formatters.js';
import { showInfoAlert } from '../../utils/alertUtils.js';
import HiveBeeLoader from '../../components/common/HiveBeeLoader.jsx';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'operadores', label: 'Trabajadores', icon: FiUsers },
  { id: 'posicionamiento', label: 'Posicionamiento', icon: FiAward },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
];

/**
 * Calendario interactivo del Centro de Operaciones:
 * Muestra el mes actual con días de la semana y resalta los días
 * que tienen eventos agendados para la organización autenticada.
 */
function OrgEventsCalendar({ events = [], onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

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

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const rawDate = ev.fecha || ev.fechaInicio || ev.startsAt;
      if (!rawDate) return;
      const dateStr = String(rawDate).split('T')[0];
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(ev);
    });
    return map;
  }, [events]);

  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const today = new Date();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${m}-${d}`;
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectedDayEvents = eventsByDate[selectedDayKey] || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      {/* Encabezado Calendario */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <FiCalendar size={15} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Agenda Cultural
            </span>
            <h3 className="font-display text-sm sm:text-base font-black text-slate-900 leading-tight">
              {monthNames[month]} {year}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Mes anterior"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            title="Mes siguiente"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
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
            className="h-8 flex items-center justify-center text-[11px] text-slate-300 select-none"
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
          const isSelected = selectedDayKey === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => setSelectedDayKey(dateKey)}
              className={`h-8 w-full rounded-xl text-xs font-bold flex items-center justify-center relative transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#0B1B3D] text-amber-300 shadow-xs ring-1 ring-[#0B1B3D]'
                  : hasEvents
                  ? 'bg-amber-100/80 text-amber-950 font-black hover:bg-amber-200'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{dayNum}</span>
              {hasEvents && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Eventos del día seleccionado */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Fecha: {selectedDayKey}
          </span>
          {selectedDayEvents.length > 0 && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'evento' : 'eventos'}
            </span>
          )}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-medium">Sin eventos programados para este día.</p>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {selectedDayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent && onSelectEvent(ev.id)}
                className="p-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/70 transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                    {ev.titulo}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <FiClock size={10} className="text-amber-600" />
                    <span>{ev.hora ? formatHora12(ev.hora) : 'Hora por confirmar'}</span>
                    <span>•</span>
                    <span className="truncate">{ev.lugar || 'Cartagena'}</span>
                  </p>
                </div>
                <span className="p-1.5 rounded-lg bg-white border border-amber-200 text-amber-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors shrink-0">
                  <FiArrowRight size={12} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrganizadorIndex() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = session.getUser() || {};
  const onboardingAlertShown = useRef(false);
  const isOperador = user.role === 'OPERADOR' || user.rol === 'OPERADOR';
  const [pageLoading, setPageLoading] = useState(true);
  const userPermisos = user.permisos || user.authorities || [];

  const dynamicMenuItems = useMemo(() => {
    if (!isOperador) {
      return [
        { id: 'resumen', label: 'Resumen', icon: FiGrid },
        { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
        { id: 'operadores', label: 'Trabajadores', icon: FiUsers },
        { id: 'posicionamiento', label: 'Posicionamiento', icon: FiAward },
        { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
        { id: 'perfil', label: 'Mi perfil', icon: FiUser },
      ];
    }

    const permisosList = Array.isArray(userPermisos)
      ? userPermisos.map((p) => String(p).toUpperCase())
      : [String(userPermisos).toUpperCase()];

    const hasAnyPerm = (keys) =>
      keys.some((k) => permisosList.some((p) => p === k || p.includes(k)));

    const items = [{ id: 'resumen', label: 'Resumen', icon: FiGrid }];

    if (hasAnyPerm(['EVENTOS', 'CREAR_EVENTO', 'EDITAR_EVENTO', 'CANCELAR_EVENTO', 'PANEL_EVENTOS'])) {
      items.push({ id: 'eventos', label: 'Mis eventos', icon: FiCalendar });
    }

    if (hasAnyPerm(['CHECK_IN', 'ENTRADAS', 'PANEL_ENTRADAS', 'BOLETOS'])) {
      items.push({ id: 'entradas', label: 'Entradas', icon: FiCreditCard });
    }

    if (hasAnyPerm(['POSICIONAMIENTO', 'PROMOCIONES', 'PANEL_POSICIONAMIENTO'])) {
      items.push({ id: 'posicionamiento', label: 'Posicionamiento', icon: FiAward });
    }

    if (hasAnyPerm(['OPERADORES', 'PANEL_TRABAJADORES', 'TRABAJADORES'])) {
      items.push({ id: 'operadores', label: 'Trabajadores', icon: FiUsers });
    }

    items.push({ id: 'perfil', label: 'Mi perfil', icon: FiUser });
    return items;
  }, [isOperador, userPermisos]);

  const [activeItem, setActiveItem] = useState(location.state?.activeItem || 'resumen');

  useEffect(() => {
    if (!location.state?.organizationOnboarding || onboardingAlertShown.current) return;

    onboardingAlertShown.current = true;
    showInfoAlert({
      title: 'Completa tu perfil',
      text: 'Completa los datos restantes de tu organización y carga el RUT para iniciar la verificación.',
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!dynamicMenuItems.some((m) => m.id === activeItem)) {
      setActiveItem('resumen');
    }
  }, [dynamicMenuItems, activeItem]);

  const [creationView, setCreationView] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [solicitudVerif, setSolicitudVerif] = useState(null);

  const [allOrgEvents, setAllOrgEvents] = useState([]);

  const [estadisticasBackend, setEstadisticasBackend] = useState({
    totalBoletasVendidasPorEventosPublicados: 0,
    ingresosNetos: 0,
    totalEventosActivos: 0,
    eventos: [],
  });

  const [stats, setStats] = useState({
    eventosActivos: 0,
    entradasVendidas: 0,
    totalEventos: 0,
    totalRecaudo: 0,
  });

  const [carteleraEvents, setCarteleraEvents] = useState([]);
  const [carteleraPage, setCarteleraPage] = useState(0);
  const [carteleraTotal, setCarteleraTotal] = useState(0);
  const carteleraPageSize = 5;

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

  const loadData = useCallback(() => {
    const pOrg = organizerService
      .getMiOrganizacion()
      .then((data) => {
        if (data) setOrgData(data);
      })
      .catch(() => {});

    const pSol = organizerService
      .getMiSolicitudVerificacion()
      .then((data) => {
        if (data) setSolicitudVerif(data);
      })
      .catch(() => {});

    const pEst = organizerService
      .getEstadisticasMiOrganizacion()
      .then((res) => {
        if (res) {
          const rawItems =
            res.eventos?.content ||
            (Array.isArray(res.eventos)
              ? res.eventos
              : res.estadisticasEventos || res.listaEventos || []);
          setEstadisticasBackend({
            totalBoletasVendidasPorEventosPublicados:
              res.totalBoletasVendidasPorEventosPublicados ??
              res.totalBoletas ??
              res.totalBoletasVendidas ??
              0,
            ingresosNetos: res.ingresosNetos ?? res.totalIngresos ?? 0,
            totalEventosActivos: res.totalEventosActivos ?? 0,
            eventos: Array.isArray(rawItems) ? rawItems : [],
          });
        }
      })
      .catch((err) => {
        console.warn('Estadísticas backend no disponibles, usando cálculo alterno:', err);
      });

    const pEvs = organizerService
      .getEventosOrganizador({ page: 0, size: 200 })
      .then((events) => {
        const list = (events || []).filter(
          (e) =>
            (e.estado || '').toUpperCase() !== 'FINALIZADO' &&
            (e.rawStatus || '').toUpperCase() !== 'FINALIZADO'
        );
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

    const pCartelera = fetchCarteleraPage(0);

    Promise.allSettled([pOrg, pSol, pEst, pEvs, pCartelera]).finally(() => {
      setTimeout(() => {
        setPageLoading(false);
      }, 350);
    });
  }, [fetchCarteleraPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const orgName =
    orgData?.nombre || orgData?.razonSocial || session.getUser()?.name || 'Mi Organización';
  const representativeName =
    orgData?.representante || session.getUser()?.name || 'Representante';

  const organizationStatuses = [
    String(orgData?.estado || '').toUpperCase(),
    String(solicitudVerif?.estado || '').toUpperCase(),
  ];
  const isOrgSuspended = organizationStatuses.includes('SUSPENDIDA');
  const hasRutUploaded = Boolean(
    orgData?.rutUrl ||
      orgData?.urlRut ||
      orgData?.urlRutTemporal ||
      orgData?.urlDocumento ||
      orgData?.urlDocumentoRut ||
      orgData?.urlArchivo ||
      orgData?.documentoRut ||
      solicitudVerif?.rutUrl ||
      solicitudVerif?.urlRut ||
      solicitudVerif?.urlRutTemporal ||
      solicitudVerif?.urlDocumento ||
      solicitudVerif?.urlDocumentoRut ||
      solicitudVerif?.urlArchivo ||
      solicitudVerif?.url ||
      String(solicitudVerif?.estado || '').toUpperCase() === 'PENDIENTE' ||
      organizationStatuses.some((status) =>
        ['PENDIENTE', 'PENDIENTE_REVISION', 'APROBADA'].includes(status)
      )
  );
  const canSendEvents = !isOrgSuspended && hasRutUploaded;

  const activeMenu = menuItems.find((m) => m.id === activeItem);

  const showSuccess = () => {
    setCreationView(null);
    setActiveItem('eventos');
    setNotification(true);
    loadData();
  };

  const returnToEvents = () => {
    setCreationView(null);
    setActiveItem('eventos');
    setNotification(false);
  };

  // Próximos eventos ordenados
  const upcomingEvents = useMemo(() => {
    return [...allOrgEvents]
      .filter((e) => e.estado === 'PUBLICADO')
      .slice(0, 3);
  }, [allOrgEvents]);

  const totalBoletasVendidasGlobal =
    estadisticasBackend.totalBoletasVendidasPorEventosPublicados || stats.entradasVendidas;
  const totalIngresosGlobalNeto =
    estadisticasBackend.ingresosNetos || stats.totalRecaudo;

  // Cartelera columns
  const carteleraColumns = [
    {
      header: 'Evento Cultural',
      key: 'titulo',
      render: (_, row) => (
        <div className="flex items-center gap-3 py-1">
          {row.foto || row.imagen ? (
            <img
              src={row.foto || row.imagen}
              alt={row.titulo}
              className="w-12 h-10 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
          ) : (
            <div className="w-12 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
              <FiCalendar size={16} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-extrabold text-slate-900 text-xs truncate">
              {row.titulo}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{row.fecha ? formatFecha(row.fecha) : 'Fecha por confirmar'}</span>
              <span>•</span>
              <span className="truncate">{row.lugar || 'Cartagena'}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Categoría',
      key: 'categoria',
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
          <FiTag size={10} className="text-amber-500" />
          {row.categoria?.nombre || (typeof row.categoria === 'string' ? row.categoria : 'General')}
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
        return <Badge tone={toneMap[val] || 'neutral'}>{val || 'SIN ESTADO'}</Badge>;
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
          className="text-xs font-bold text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
        >
          <FiEye size={12} />
          <span>Detalle</span>
        </button>
      ),
    },
  ];

  const renderDashboardTab = () => {
    switch (activeItem) {
      case 'resumen':
        return (
          <div className="space-y-6">
            {/* STAGE 1: Hero Operational Command Header + Metric Pulse */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
              {/* Bloque Izquierdo: Bienvenida Editorial y Acciones */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
                {/* Elemento sutil de marca */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-400/10 via-amber-400/5 to-transparent rounded-bl-full pointer-events-none" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black uppercase tracking-wider">
                      <FiStar size={11} className="text-amber-600" />
                      Centro de Gestión Cultural
                    </span>
                    {hasRutUploaded && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <FiShield size={11} /> Verificada
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 leading-tight">
                    {orgName}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
                    ¡Hola, <strong>{representativeName}</strong>! Administra tus experiencias culturales, supervisa la venta de boletas en tiempo real y potencia la presencia de tus producciones en Cartagena.
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreationView('wizard')}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B3D] px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <FiPlus size={15} />
                    <span>Crear nuevo evento</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveItem('eventos')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
                  >
                    <FiCalendar size={13} className="text-slate-400" />
                    <span>Ver mis eventos</span>
                    <FiArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveItem('entradas')}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <FiCreditCard size={13} />
                    <span>Reporte de entradas</span>
                  </button>
                </div>
              </div>

              {/* Bloque Derecho: Métricas de Operación Asimétricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                {/* Métrica 1: Boletas Vendidas */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                      <FiCreditCard size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                        Boletas Vendidas
                      </span>
                      <strong className="text-xl sm:text-2xl font-black font-display text-slate-900">
                        {totalBoletasVendidasGlobal.toLocaleString('es-CO')}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Eventos publicados activos
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-100/70 text-amber-900 shrink-0">
                    Boletería
                  </span>
                </div>

                {/* Métrica 2: Recaudo Neto */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                      <FiDollarSign size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                        Recaudo Neto Organización
                      </span>
                      <strong className="text-xl sm:text-2xl font-black font-display text-slate-900">
                        {formatPrice(totalIngresosGlobalNeto)}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Sin comisiones de plataforma
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 shrink-0">
                    Neto Org
                  </span>
                </div>

                {/* Métrica 3: Eventos Activos en Cartelera */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-3 rounded-2xl bg-[#0B1B3D] text-amber-300 shrink-0">
                      <FiActivity size={20} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                        Eventos en Cartelera Activa
                      </span>
                      <strong className="text-xl sm:text-2xl font-black font-display text-slate-900">
                        {estadisticasBackend.totalEventosActivos || stats.eventosActivos}
                      </strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Visibles al público en Cartagena
                      </span>
                    </div>
                  </div>
                  <Badge tone={(estadisticasBackend.totalEventosActivos || stats.eventosActivos) > 0 ? 'active' : 'neutral'}>
                    {(estadisticasBackend.totalEventosActivos || stats.eventosActivos) > 0 ? 'En vivo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* STAGE 2: Próximos Eventos Destacados (Mini-Timeline) */}
            {upcomingEvents.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm sm:text-base font-black text-slate-900">
                      Próximas Experiencias en Cartelera
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Eventos culturales agendados para los próximos días
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveItem('eventos')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos</span> <FiArrowRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upcomingEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className="group p-4 rounded-2xl border border-slate-200/80 hover:border-amber-400 bg-white hover:bg-amber-50/20 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        {ev.foto || ev.imagen ? (
                          <img
                            src={ev.foto || ev.imagen}
                            alt={ev.titulo}
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 font-bold">
                            EH
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block truncate">
                            {ev.categoria?.nombre || (typeof ev.categoria === 'string' ? ev.categoria : 'Cultura')}
                          </span>
                          <h4 className="font-display font-extrabold text-xs text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                            {ev.titulo}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <FiClock size={11} className="text-slate-400" />
                            <span>{ev.fecha ? formatFecha(ev.fecha) : 'Próximamente'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 truncate">{ev.lugar || 'Cartagena'}</span>
                        <span className="font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                          Gestionar <FiArrowRight size={11} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAGE 3: Cartelera General Paginada + Calendario Interactivo */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
              {/* Cartelera General */}
              <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-black text-slate-900">
                      Cartelera General de Publicaciones
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Control editorial y estado de las producciones
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveItem('eventos')}
                    className="text-xs font-bold text-slate-700 hover:text-amber-700 bg-slate-100 hover:bg-amber-100/70 px-3 py-1.5 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
                  >
                    Ver cartelera completa <FiArrowRight size={11} />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3 px-5">Evento Cultural</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {carteleraEvents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            No tienes eventos registrados actualmente.
                          </td>
                        </tr>
                      ) : (
                        carteleraEvents.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-5">
                              {carteleraColumns[0].render(null, row)}
                            </td>
                            <td className="py-3 px-4">
                              {carteleraColumns[1].render(null, row)}
                            </td>
                            <td className="py-3 px-4">
                              {carteleraColumns[2].render(row.estado, row)}
                            </td>
                            <td className="py-3 px-5 text-right">
                              {carteleraColumns[3].render(null, row)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {carteleraTotal > carteleraPageSize && (
                  <div className="p-4 border-t border-slate-100 bg-white">
                    <Pagination
                      currentPage={carteleraPage + 1}
                      totalItems={carteleraTotal}
                      pageSize={carteleraPageSize}
                      onPageChange={(p) => fetchCarteleraPage(p - 1)}
                      pageSizeOptions={[5]}
                    />
                  </div>
                )}
              </div>

              {/* Calendario Cultural Interactivo */}
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
      case 'operadores':
        return <OperadoresView />;
      case 'posicionamiento':
        return <PosicionamientoView />;
      case 'entradas':
        return <EntradasView />;
      case 'perfil':
        return <PerfilOrganizador />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (creationView === 'wizard') {
      return (
        <>
          <div className="lg:hidden">
            <CreateEventWizard
              initialEvent={editingEvent}
              isDrawer={false}
              canSendEvents={canSendEvents}
              orgSuspended={isOrgSuspended}
              onBack={() => {
                setEditingEvent(null);
                returnToEvents();
              }}
              onSave={() => {
                setEditingEvent(null);
                showSuccess();
              }}
            />
          </div>
          <div className="hidden lg:block">
            {renderDashboardTab()}
          </div>
        </>
      );
    }

    return renderDashboardTab();
  };

  if (pageLoading) {
    return (
      <HiveBeeLoader
        text="Cargando..."
        subtext={isOperador ? 'Panel del Operador' : 'Centro de Operaciones'}
        fullScreen={true}
      />
    );
  }

  return (
    <StandardLayout
      role={isOperador ? 'Operador' : 'Organización'}
      menuItems={dynamicMenuItems}
      activeItem={creationView === 'wizard' ? null : activeItem}
      onSelect={(item) => {
        setCreationView(null);
        setSelectedEventId(null);
        setNotification(false);
        setActiveItem(item);
      }}
      headerProps={{
        title: activeMenu ? activeMenu.label : 'Centro de Operaciones',
        subtitle: `Gestión de producciones culturales · ${orgName}`,
        userName: orgName,
        userInitials: orgName.slice(0, 2).toUpperCase(),
        userPhoto: orgData?.urlLogo || orgData?.logo || null,
        onProfileClick: () => {
          setCreationView(null);
          setSelectedEventId(null);
          setActiveItem('perfil');
        },
      }}
      maxWidthClass="max-w-[1360px]"
    >
      {notification && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-xs animate-in fade-in duration-200">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
            <FiCheck size={14} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-900">Evento registrado exitosamente</p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Tu evento fue guardado correctamente y ya se encuentra visible en tu cartelera.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar notificación"
            onClick={() => setNotification(false)}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <FiX size={15} />
          </button>
        </div>
      )}

      {renderContent()}

      {/* Detalle de evento en modal lateral desde la derecha (estilo Wizard) */}
      {selectedEventId && (
        <EventDetailView
          eventId={selectedEventId}
          canSendEvents={canSendEvents}
          orgSuspended={isOrgSuspended}
          onBack={() => setSelectedEventId(null)}
          onEdit={(eventToEdit) => {
            setSelectedEventId(null);
            setEditingEvent(eventToEdit);
            setCreationView('wizard');
          }}
          isDrawer={true}
        />
      )}

      {/* En pantallas de escritorio (lg+), el wizard se despliega en drawer lateral */}
      {creationView === 'wizard' && (
        <div className="hidden lg:block">
          <CreateEventWizard
            initialEvent={editingEvent}
            isDrawer={true}
            canSendEvents={canSendEvents}
            orgSuspended={isOrgSuspended}
            onBack={() => {
              setEditingEvent(null);
              returnToEvents();
            }}
            onSave={() => {
              setEditingEvent(null);
              showSuccess();
            }}
          />
        </div>
      )}
    </StandardLayout>
  );
}
