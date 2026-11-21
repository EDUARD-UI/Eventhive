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
import ProductionDeskMainView from '../../components/componentsOrganizador/ProductionDeskMainView.jsx';

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
  const [eventsRefreshKey, setEventsRefreshKey] = useState(0);

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
    setEventsRefreshKey((k) => k + 1);

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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eventhive:events_updated', { detail: savedEvent }));
    }

    loadData();
  };

  const returnToEvents = () => {
    setCreationView(null);
    setActiveItem('eventos');
    setNotification(false);
    setEventsRefreshKey((k) => k + 1);
    loadData();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('eventhive:events_updated', { detail: null }));
    }
  };

  // Próximos eventos ordenados
  const upcomingEvents = useMemo(() => {
    return [...allOrgEvents]
      .filter((e) => e.estado === 'PUBLICADO')
      .slice(0, 3);
  }, [allOrgEvents]);

  // Eventos publicados exclusivamente para la cartelera y el calendario
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
          <ProductionDeskMainView
            events={allOrgEvents}
            orgData={orgData}
            user={user}
            representativeName={representativeName}
            orgName={orgName}
            onCreateEvent={() => setCreationView('wizard')}
            onSelectEvent={(eventId) => setSelectedEventId(eventId)}
            onNavigate={(tab) => setActiveItem(tab)}
            hasRutUploaded={hasRutUploaded}
            isLoading={pageLoading}
          />
        );
      case 'eventos':
        return (
          <MiEvento
            key={`mi-evento-${eventsRefreshKey}`}
            onCreate={() => setCreationView('wizard')}
            onViewDetail={(eventId) => setSelectedEventId(eventId)}
            initialEvents={allOrgEvents}
            refreshTrigger={eventsRefreshKey}
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
      maxWidthClass={activeItem === 'resumen' ? 'max-w-[1540px]' : 'max-w-[1360px]'}
    >
      {notification && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3.5 shadow-xs animate-in fade-in duration-200">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0">
            <FiCheck size={14} />
          </span>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-900">¡Arriba el telón!</p>
            <p className="mt-0.5 text-[11px] text-slate-600">
              Tu evento ya está en cartelera y la taquilla digital quedó abierta.
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
