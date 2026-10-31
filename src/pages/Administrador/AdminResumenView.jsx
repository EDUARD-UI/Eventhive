import React from 'react';
import {
  Users,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  Clock,
  CheckCircle2,
  Ban,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  ClipboardList,
} from 'lucide-react';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import PlatformMetricsChart from '../../components/componentsAdmin/PlatformMetricsChart.jsx';

export default function AdminResumenView({
  metrics,
  commercialMetrics,
  organizaciones = [],
  eventos = [],
  organizacionesPorValidacion = null,
  eventosPorEstado = [],
  eventosPorCategoria = [],
  onNavigateTab,
  onVerOrganizacion,
}) {
  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Estados de organizaciones desde endpoint /admin/estadisticas/organizaciones-por-validacion o metrics
  const totalOrgs = organizacionesPorValidacion?.total ?? metrics?.totalOrganizaciones ?? 0;
  const pendientesValidacionRut =
    organizacionesPorValidacion?.pendientesValidacionRut ??
    metrics?.solicitudesVerificacionPendientes ??
    0;
  const sinRutCount = organizacionesPorValidacion?.sinRut ?? metrics?.sinRut ?? 0;

  const orgsPorEstadoBackend = organizacionesPorValidacion?.porEstado || [];
  const aprobadasCount =
    orgsPorEstadoBackend.find((e) => e.estado === 'APROBADA')?.cantidad ??
    metrics?.organizacionesAprobadas ??
    0;
  const suspendidasCount =
    orgsPorEstadoBackend.find((e) => e.estado === 'SUSPENDIDA')?.cantidad ??
    metrics?.organizacionesSuspendidas ??
    0;
  const enRevisionCount =
    orgsPorEstadoBackend.find((e) => e.estado === 'PENDIENTE_REVISION' || e.estado === 'PENDIENTE')?.cantidad ??
    pendientesValidacionRut;

  // Estados de eventos desde endpoint /admin/estadisticas/eventos-por-estado o metrics
  const getEventCount = (estadoName) => {
    if (Array.isArray(eventosPorEstado) && eventosPorEstado.length > 0) {
      const found = eventosPorEstado.find(
        (e) => e.estado?.toUpperCase() === estadoName.toUpperCase()
      );
      if (found) return found.cantidad;
    }
    // Fallback a metrics
    switch (estadoName) {
      case 'PUBLICADO':
        return metrics?.eventosPublicados || 0;
      case 'PENDIENTE_REVISION':
        return metrics?.eventosPendientesRevision || 0;
      case 'EN_CORRECCION':
        return metrics?.eventosEnCorreccion || 0;
      case 'FINALIZADO':
        return metrics?.eventosFinalizados || 0;
      case 'CANCELADO':
        return metrics?.eventosCancelados || 0;
      case 'SUSPENDIDO':
        return metrics?.eventosSuspendidos || 0;
      default:
        return 0;
    }
  };

  // Organizaciones con solicitudes o pendientes
  const orgsRequierenAtencion = organizaciones.filter(
    (o) => o.estado === 'PENDIENTE' || o.estado === 'PENDIENTE_REVISION' || o.estado === 'SUSPENDIDA' || o.estado === 'RECHAZADA'
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-brand">Administración</p>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Panel de Resumen Global
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Supervisión integral de organizaciones, validaciones de RUT, métricas comerciales y actividad en Eventhive.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('organizaciones')}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <Building2 className="h-4 w-4" strokeWidth={1.75} />
            <span>Gestionar Organizaciones</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('solicitudes')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            <ClipboardList className="h-4 w-4 text-slate-500" strokeWidth={1.75} />
            <span>Organizaciones por Validación</span>
          </button>
        </div>
      </div>

      {/* Indicadores Agregados de la Plataforma (Requerimiento 6) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <span>Indicadores Agregados de Plataforma</span>
            </h2>
            <p className="text-xs text-slate-500">
              Métricas consolidadas de la plataforma en tiempo real
            </p>
          </div>
        </div>

        {/* Grid de 4 KPIs Oficiales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Número de organizaciones"
            value={totalOrgs}
            subtitle={`${aprobadasCount} activas/aprobadas`}
            icon={Building2}
            color="primary"
          />
          <StatCard
            title="Organizaciones pendientes de validar el RUT"
            value={pendientesValidacionRut}
            subtitle="Documento RUT en espera de validación"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Organizaciones que no han cargado el RUT"
            value={sinRutCount}
            subtitle="Sin documento RUT registrado"
            icon={AlertTriangle}
            color="rose"
          />
          <StatCard
            title="Comisiones de EventHive"
            value={formatCOP(commercialMetrics?.comisionesVentas ?? metrics?.comisionesVentas ?? 0)}
            subtitle="Comisiones comerciales sobre ventas"
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* Sub-tarjetas de Estado Detallado (Organizaciones y Eventos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Desglose Organizaciones */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                <span>Estado de Organizaciones</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('organizaciones')}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Ver todas</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2} />
                  <span>Aprobadas</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {aprobadasCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                  <span>Por Validación</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {pendientesValidacionRut}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-semibold mb-0.5">
                  <Ban className="w-3.5 h-3.5 text-rose-500" strokeWidth={2} />
                  <span>Suspendidas</span>
                </div>
                <div className="text-lg font-black text-slate-900">
                  {suspendidasCount}
                </div>
              </div>
            </div>
          </div>

          {/* Desglose Estados de Eventos (Nuevo endpoint /admin/estadisticas/eventos-por-estado) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                <span>Resumen de Estados de Eventos</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Total: {(metrics?.totalEventos || 0)}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block truncate">Publicados</span>
                <span className="text-base font-black text-emerald-800">
                  {getEventCount('PUBLICADO')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block truncate">Revisión</span>
                <span className="text-base font-black text-amber-800">
                  {getEventCount('PENDIENTE_REVISION')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block truncate">Corrección</span>
                <span className="text-base font-black text-blue-800">
                  {getEventCount('EN_CORRECCION')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 block truncate">Finalizados</span>
                <span className="text-base font-black text-slate-800">
                  {getEventCount('FINALIZADO')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 block truncate">Cancelados</span>
                <span className="text-base font-black text-slate-800">
                  {getEventCount('CANCELADO')}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-700 block truncate">Suspendidos</span>
                <span className="text-base font-black text-rose-800">
                  {getEventCount('SUSPENDIDO')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                <span>Organizaciones con más ventas</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('reportes')}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Ver reportes</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            {Array.isArray(commercialMetrics?.topOrganizaciones) && commercialMetrics.topOrganizaciones.length > 0 ? (
              <div className="space-y-2">
                {commercialMetrics.topOrganizaciones.slice(0, 5).map((org, index) => (
                  <div
                    key={org.organizacionId || org.id || index}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-900">
                          {org.razonSocial || org.nombre || 'Organización'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {Number(org.entradasVendidas || 0)} entradas vendidas
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-slate-900">
                      {formatCOP(org.totalVentas)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs text-slate-500">
                No hay ventas de organizaciones registradas actualmente.
              </p>
            )}
          </div>
      </div>

      {/* Gráfica de Eventos por Categoría (Reemplaza densidad por zona) */}
      <PlatformMetricsChart eventosPorCategoria={eventosPorCategoria} />
    </div>
  );
}
