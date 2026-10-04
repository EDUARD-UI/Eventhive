import React, { useState, useEffect, useCallback } from 'react';
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
  FiChevronDown,
  FiCreditCard,
  FiGrid,
  FiPlus,
  FiTag,
  FiUser,
  FiX,
  FiArrowRight,
  FiEye,
  FiLayers,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { session } from '../../services/session.js';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
];

function CategoryChart({ data = [] }) {
  if (!data.length) {
    return (
      <section className="rounded-3xl border-2 border-amber-200/90 bg-white p-5 sm:p-6 shadow-sm">
        <h3 className="font-display text-base font-black text-[#0B1B3D]">
          Eventos por Categoría
        </h3>
        <p className="text-xs text-slate-500 mt-2 font-medium">
          No hay datos de categorías disponibles.
        </p>
      </section>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.cantidadEventos || 0), 1);

  return (
    <section className="rounded-3xl border-2 border-amber-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="border-b border-amber-100 pb-4">
        <h3 className="font-display text-base font-black text-[#0B1B3D]">
          Eventos por Categoría
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Distribución de eventos de tu organización
        </p>
      </div>

      <div className="mt-6 flex h-[160px] items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6">
        {data.map(({ nombre, cantidadEventos }) => {
          const pct = maxVal > 0 ? Math.round((cantidadEventos / maxVal) * 100) : 0;
          return (
            <div
              key={nombre}
              className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-10">
                <span className="rounded-lg bg-[#0B1B3D] px-2 py-1 text-[10px] font-bold text-amber-300 shadow-md whitespace-nowrap border border-amber-400/30">
                  {cantidadEventos} eventos
                </span>
                <div className="w-1.5 h-1.5 bg-[#0B1B3D] rotate-45 -mt-0.5" />
              </div>

              <div
                className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 group-hover:from-amber-600 group-hover:to-amber-400 transition-all duration-300 shadow-xs"
                style={{ height: `${Math.max(pct, 5)}%` }}
              />
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">
                {nombre}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function OrganizadorIndex() {
  const [activeItem, setActiveItem] = useState('resumen');
  const [creationView, setCreationView] = useState(null);
  const [notification, setNotification] = useState(false);
  const [orgData, setOrgData] = useState(null);

  // Resumen stats from backend
  const [stats, setStats] = useState({
    eventosActivos: 0,
    entradasVendidas: 0,
    totalEventos: 0,
  });
  const [categoryChartData, setCategoryChartData] = useState([]);

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
        const activos = list.filter((e) => e.estado === 'PUBLICADO').length;
        const vendidas = list.reduce((sum, e) => {
          if (e.localidades) {
            return sum + e.localidades.reduce((s, loc) => s + ((loc.capacidad || 0) - (loc.disponibles || 0)), 0);
          }
          return sum;
        }, 0);

        setStats({
          eventosActivos: activos,
          entradasVendidas: vendidas,
          totalEventos: list.length,
        });

        // Build category chart from org events
        const catMap = {};
        list.forEach((e) => {
          const catName = e.categoria?.nombre || 'Sin categoría';
          catMap[catName] = (catMap[catName] || 0) + 1;
        });
        setCategoryChartData(
          Object.entries(catMap).map(([nombre, cantidadEventos]) => ({
            nombre,
            cantidadEventos,
          }))
        );
      })
      .catch(() => {});

    // Fetch cartelera first page
    fetchCarteleraPage(0);

    return () => {
      isMounted = false;
    };
  }, [fetchCarteleraPage]);

  const orgName = orgData?.nombre || orgData?.razonSocial || session.getUser()?.name || 'Mi Organización';

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

  // Cartelera columns — item 3: nombre, categoría, estado, acción "Ver detalle"
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
          className="text-xs font-bold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          <FiEye size={12} /> Ver detalle
        </button>
      ),
    },
  ];

  const renderContent = () => {
    // Event detail view — internal navigation (item 3, 15)
    if (selectedEventId) {
      return (
        <EventDetailView
          eventId={selectedEventId}
          onBack={() => setSelectedEventId(null)}
          onEdit={() => {
            // Could open wizard in edit mode
          }}
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
            {/* Banner de Bienvenida y Acceso Rápido Colmena */}
            <div className="rounded-3xl bg-[#0B1B3D] border border-amber-500/20 p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-xl">
                <span className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <span>⬡</span>
                  <span>PANEL DE GESTIÓN CULTURAL</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {orgName}
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
                  Supervisa tus experiencias culturales, administra tus entradas oficiales y valida accesos en tiempo real con QR.
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCreationView('wizard')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <FiPlus size={16} />
                  <span>Publicar Evento</span>
                </button>
              </div>
            </div>

            {/* KPIs — item 2: activos, vendidas, total eventos (NO aforo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Eventos Activos"
                value={String(stats.eventosActivos)}
                change={stats.eventosActivos > 0 ? `${stats.eventosActivos} en cartelera` : 'Sin eventos activos'}
                trend="up"
                icon={FiCalendar}
                iconBg="bg-blue-50"
                iconColor="text-brand"
              />
              <StatCard
                label="Entradas Vendidas"
                value={String(stats.entradasVendidas)}
                change={stats.entradasVendidas > 0 ? `${stats.entradasVendidas} vendidas` : '0 vendidas'}
                trend="up"
                icon={FiCreditCard}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                label="Total Eventos"
                value={String(stats.totalEventos)}
                change={`${stats.totalEventos} registrados`}
                trend="up"
                icon={FiLayers}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>

            {/* Gráfico de categorías — item 2: datos del backend */}
            <CategoryChart data={categoryChartData} />

            {/* Cartelera — item 3: paginada, solo org autenticada */}
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-black text-[#0B1B3D]">
                    Cartelera de Eventos
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Eventos de tu organización
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveItem('eventos')}
                  className="text-xs font-bold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1"
                >
                  Ver todos los eventos <FiArrowRight size={11} />
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
