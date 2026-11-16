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
import BackstageHeroSection from '../../components/componentsOrganizador/BackstageHeroSection.jsx';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'operadores', label: 'Trabajadores', icon: FiUsers },
  { id: 'posicionamiento', label: 'Posicionamiento', icon: FiAward },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
];

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
      .getEventosOrganizador({ page: 0, size: 50 })
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
      setPageLoading(false);
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

  const showSuccess = (savedEvent) => {
    setCreationView(null);
    setEditingEvent(null);
    setActiveItem('eventos');
    setNotification(true);

    if (savedEvent && (savedEvent.id || savedEvent.eventoId)) {
      const eventId = savedEvent.id || savedEvent.eventoId;
      setAllOrgEvents((prev) => {
        const index = prev.findIndex((e) => (e.id || e.eventoId) === eventId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...savedEvent };
          return updated;
        }
        return [savedEvent, ...prev];
      });

      setCarteleraEvents((prev) => {
        const index = prev.findIndex((e) => (e.id || e.eventoId) === eventId);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...savedEvent };
          return updated;
        }
        return [savedEvent, ...prev];
      });

      setCarteleraTotal((prev) => prev + 1);
    }

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

  // Eventos publicados exclusivamente para la experiencia Backstage y el Calendario
  const publishedEvents = useMemo(() => {
    return (allOrgEvents || []).filter(
      (e) => (e.estado || '').toUpperCase() === 'PUBLICADO'
    );
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
                      Centro de Control · Backstage
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

            {/* STAGE 2: Experiencia Protagonista Backstage + Calendario Visual (Two-Column Hero) */}
            <BackstageHeroSection
              publishedEvents={publishedEvents}
              onSelectEvent={(id) => setSelectedEventId(id)}
              onCreateEvent={() => setCreationView('wizard')}
              isLoading={pageLoading}
            />

            {/* STAGE 3: Cartelera General Paginada */}
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
                          <p className="font-semibold text-slate-700">El escenario está vacío.</p>
                          <p className="text-xs text-slate-400 mt-1">Es hora de preparar el próximo gran evento cultural.</p>
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
    return renderDashboardTab();
  };

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

      {/* Drawer de Creación y Edición Asistida de Eventos (Inspirado en Luma) */}
      {creationView === 'wizard' && (
        <CreateEventWizard
          initialEvent={editingEvent}
          isDrawer={true}
          canSendEvents={canSendEvents}
          orgSuspended={isOrgSuspended}
          onBack={() => {
            setEditingEvent(null);
            returnToEvents();
          }}
          onSave={(savedEvent) => {
            showSuccess(savedEvent);
          }}
        />
      )}
    </StandardLayout>
  );
}
