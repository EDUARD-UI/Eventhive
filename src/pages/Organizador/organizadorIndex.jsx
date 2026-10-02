import React, { useState, useEffect } from 'react';
import StandardLayout from '../../layouts/StandardLayout.jsx';
import StatCard from '../../components/Shared/StatCard.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';

import CreateEventWizard from '../../components/componentsOrganizador/CreateEventWizard.jsx';
import MiEvento from './MiEvento.jsx';
import AsistentesView from './AsistentesView.jsx';
import EntradasView from './EntradasView.jsx';
import PerfilOrganizador from './PerfilOrganizador.jsx';
import ActividadesView from './ActividadesView.jsx';
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiCreditCard,
  FiDollarSign,
  FiGrid,
  FiPlus,
  FiTag,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiX,
  FiArrowRight,
  FiClock,
} from 'react-icons/fi';
import { organizerService } from '../../services/organizerService.js';
import { session } from '../../services/session.js';

const menuItems = [
  { id: 'resumen', label: 'Resumen', icon: FiGrid },
  { id: 'eventos', label: 'Mis eventos', icon: FiCalendar },
  { id: 'asistentes', label: 'Asistentes', icon: FiUsers },
  { id: 'entradas', label: 'Entradas', icon: FiCreditCard },
  { id: 'perfil', label: 'Mi perfil', icon: FiUser },
  { id: 'actividades', label: 'Actividades Recientes', icon: FiTrendingUp },
];

const chartData = [
  { label: 'Académico', value: 70, amount: '$18.2M' },
  { label: 'Gastronómico', value: 100, amount: '$42.5M' },
  { label: 'Cultural', value: 52, amount: '$14.8M' },
  { label: 'Entretenimiento', value: 84, amount: '$36.0M' },
  { label: 'Deportivo', value: 38, amount: '$8.5M' },
  { label: 'Música', value: 65, amount: '$24.1M' },
];

function SalesChart() {
  const [period, setPeriod] = useState('Este mes');

  return (
    <section className="rounded-3xl border-2 border-amber-200/90 bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-4">
        <div>
          <h3 className="font-display text-base font-black text-[#0B1B3D]">
            Rendimiento de Ventas por Categoría
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Distribución de volumen transaccional en Cartagena de Indias
          </p>
        </div>

        <div className="relative self-start sm:self-auto">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none rounded-xl border border-amber-200 bg-[#FAF8F5] py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 outline-none hover:border-amber-400 focus:border-amber-500 cursor-pointer transition-colors shadow-2xs"
          >
            <option>Este mes</option>
            <option>Últimos 7 días</option>
            <option>Este año</option>
          </select>
          <FiChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={13}
          />
        </div>
      </div>

      {/* Gráfico de barras estilizado */}
      <div className="mt-6 flex h-[160px] items-end justify-between gap-4 sm:gap-8 px-2 sm:px-6">
        {chartData.map(({ label, value, amount }) => (
          <div
            key={label}
            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            {/* Tooltip en hover */}
            <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-10">
              <span className="rounded-lg bg-[#0B1B3D] px-2 py-1 text-[10px] font-bold text-amber-300 shadow-md whitespace-nowrap border border-amber-400/30">
                {amount}
              </span>
              <div className="w-1.5 h-1.5 bg-[#0B1B3D] rotate-45 -mt-0.5" />
            </div>

            <div
              className="w-full max-w-[56px] rounded-t-xl bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-300 group-hover:from-amber-600 group-hover:to-amber-400 transition-all duration-300 shadow-xs"
              style={{ height: `${value}%` }}
            />
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 text-center truncate w-full">
              {label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function OrganizadorIndex() {
  const [activeItem, setActiveItem] = useState('resumen');
  const [creationView, setCreationView] = useState(null);
  const [notification, setNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    organizerService.getEventosOrganizador({ page: 0, size: 50 })
      .then((data) => {
        if (!isMounted) return;
        const normalized = (data || []).map((e) => ({
          ...e,
          id: e.id,
          title: e.titulo || e.title,
          category: e.categoria?.nombre || e.categoria || 'Evento',
          date: e.fecha || e.date || 'Próximamente',
          time: e.hora || e.time || '7:00 PM',
          location: e.lugar || e.ubicacion || e.location || 'Cartagena de Indias',
          price: e.precio ?? e.localidades?.[0]?.precio ?? 0,
          status: e.estado === 'PUBLICADO' ? 'Activo' : e.estado === 'FINALIZADO' ? 'Finalizado' : 'Borrador',
          tone: e.estado === 'PUBLICADO' ? 'active' : e.estado === 'FINALIZADO' ? 'neutral' : 'warning',
          sold: e.entradasVendidas ?? e.boletosVendidos ?? 0,
          capacity: e.aforoMaximo ?? e.capacidad ?? 100,
          photo: e.foto || e.imagen || null,
        }));
        setOrganizerEvents(normalized);
      })
      .catch(() => {});

    organizerService.getMiOrganizacion()
      .then((data) => {
        if (isMounted && data) setOrgData(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const orgName = orgData?.nombre || orgData?.razonSocial || session.getUser()?.name || 'Mi Organización';
  const activeEventsCount = organizerEvents.filter((e) => e.status === 'Activo').length;
  const totalSold = organizerEvents.reduce((acc, curr) => acc + (Number(curr.sold) || 0), 0);
  const totalCapacity = organizerEvents.reduce((acc, curr) => acc + (Number(curr.capacity) || 0), 0);

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

  const filteredEvents = organizerEvents.filter((ev) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ev.title.toLowerCase().includes(term) ||
      ev.category.toLowerCase().includes(term) ||
      (ev.location && ev.location.toLowerCase().includes(term))
    );
  });

  // Columnas para la tabla del Resumen
  const recentEventColumns = [
    {
      header: 'Evento',
      key: 'title',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.photo}
            alt={row.title}
            className="h-10 w-12 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
          />
          <div className="min-w-0">
            <p className="font-display font-bold text-slate-900 text-xs truncate">
              {row.title}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <FiCalendar size={11} className="text-slate-400" />
              <span>{row.date}</span>
              <span className="text-slate-300">•</span>
              <FiClock size={11} className="text-slate-400" />
              <span>{row.time || '7:00 PM'}</span>
            </p>
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
        const pct = row.capacity ? Math.round((row.sold / row.capacity) * 100) : 0;
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-800">
                {row.sold} <span className="font-normal text-slate-400">/ {row.capacity}</span>
              </span>
              <span className="text-[10px] font-bold text-brand">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pct >= 90 ? 'bg-emerald-500' : 'bg-brand'
                }`}
                style={{ width: `${pct}%` }}
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
        <span className={`font-semibold text-xs ${val === 0 || val === 'Gratis' ? 'text-emerald-600' : 'text-slate-900'}`}>
          {val === 0 ? 'Gratis' : val}
        </span>
      ),
    },
    {
      header: 'Acción',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setActiveItem('eventos')}
          className="text-xs font-bold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1"
        >
          Gestionar <FiArrowRight size={11} />
        </button>
      ),
    },
  ];

  const renderContent = () => {
    if (creationView === 'wizard') {
      return <CreateEventWizard onBack={returnToEvents} onSave={showSuccess} />;
    }

    switch (activeItem) {
      case 'resumen':
        return (
          <div className="space-y-6">
            {/* Banner de Bienvenida y Acceso Rápido */}
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
                  Supervisa tus experiencias culturales en Cartagena, administra tus entradas oficiales y valida accesos en tiempo real con QR.
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
                <button
                  type="button"
                  onClick={() => setActiveItem('asistentes')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/15"
                >
                  Validar Asistencia
                </button>
              </div>
            </div>

            {/* KPIs Principales con StatCard Refactorizado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Eventos Activos"
                value={String(activeEventsCount)}
                change={activeEventsCount > 0 ? `${activeEventsCount} en cartelera` : 'Sin eventos activos'}
                trend="up"
                icon={FiCalendar}
                iconBg="bg-blue-50"
                iconColor="text-brand"
              />
              <StatCard
                label="Entradas Vendidas"
                value={String(totalSold)}
                change={totalSold > 0 ? `${totalSold} vendidas` : '0 vendidas'}
                trend="up"
                icon={FiCreditCard}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                label="Aforo Total"
                value={String(totalCapacity)}
                change="Capacidad combinada"
                trend="up"
                icon={FiDollarSign}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />
              <StatCard
                label="Total Eventos"
                value={String(organizerEvents.length)}
                change={`${organizerEvents.length} registrados`}
                trend="up"
                icon={FiUsers}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
              />
            </div>

            {/* Gráfico de Ventas */}
            <SalesChart />

            {/* Tabla de Eventos Recientes con Paginación Integrada */}
            <DataTable
              title="Cartelera de Eventos Recientes"
              subtitle="Supervisa el estado y aforo de tus publicaciones"
              actionLabel="Ver todos los eventos →"
              onAction={() => setActiveItem('eventos')}
              columns={recentEventColumns}
              data={filteredEvents}
              paginate={true}
              initialPageSize={5}
              pageSizeOptions={[5, 10]}
            />
          </div>
        );
      case 'eventos':
        return (
          <MiEvento
            onCreate={() => setCreationView('wizard')}
            externalSearch={searchTerm}
          />
        );
      case 'asistentes':
        return <AsistentesView />;
      case 'entradas':
        return <EntradasView />;
      case 'perfil':
        return <PerfilOrganizador />;
      case 'actividades':
        return <ActividadesView />;
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
      }}
      headerProps={{
        title: activeMenu ? activeMenu.label : 'Panel de la Organización',
        
        showSearch: true,
        showNotifications: false,
        searchTerm: searchTerm,
        onSearchChange: setSearchTerm,
        searchPlaceholder: 'Buscar eventos, entradas...',
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
