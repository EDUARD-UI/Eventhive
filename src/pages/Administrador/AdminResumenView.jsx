import React from 'react';
import {
  Users,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  ShieldCheck,
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
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';

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
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="resumen"
        title="Centro de Control Administrativo de Eventhive"
        description="Este panel consolida en tiempo real los indicadores agregados del sistema: validación de RUT empresarial, estados de eventos, distribución por categorías y facturación general."
      />

      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-primary-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
            <span>Centro de Control Administrativo</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Resumen Global
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Supervisión integral de organizaciones, validaciones de RUT, métricas comerciales y actividad en Eventhive.
          </p>
        </div>

        {/* Acciones Rápidas en Header */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('organizaciones')}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <span>Gestionar Organizaciones</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('solicitudes')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            <span>Organizaciones por Validación</span>
          </button>
        </div>
      </div>

      {/* Indicadores Agregados de la Plataforma */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <span>Indicadores Agregados de Plataforma</span>
            </h2>
            <p className="text-xs text-slate-500">
              Métricas consolidadas y agregadas de la plataforma en tiempo real
            </p>
          </div>
        </div>

        {/* Grid de 4 KPIs Macro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Usuarios"
            value={(metrics?.totalUsuarios || 0).toLocaleString('es-CO')}
            subtitle="Cuentas registradas en plataforma"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Total Organizaciones"
            value={totalOrgs}
            subtitle={`${aprobadasCount} aprobadas • ${pendientesValidacionRut} por validar`}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="Tickets Vendidos"
            value={(metrics?.ticketsVendidos || 0).toLocaleString('es-CO')}
            subtitle="Entradas emitidas con QR"
            icon={Ticket}
            color="violet"
          />
          <StatCard
            title="Ventas Totales"
            value={formatCOP(metrics?.ventasTotales || 0)}
            subtitle="Recaudo registrado"
            icon={DollarSign}
            color="amber"
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
              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-semibold mb-0.5">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={2} />
                  <span>Aprobadas</span>
                </div>
                <div className="text-lg font-black text-emerald-800">
                  {aprobadasCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-semibold mb-0.5">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  <span>Por Validación</span>
                </div>
                <div className="text-lg font-black text-amber-800">
                  {pendientesValidacionRut}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-0.5">
                  <Ban className="w-3 h-3" strokeWidth={2} />
                  <span>Suspendidas</span>
                </div>
                <div className="text-lg font-black text-rose-800">
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
      </div>

      {/* Gráfica de Eventos por Categoría (Reemplaza densidad por zona) */}
      <PlatformMetricsChart eventosPorCategoria={eventosPorCategoria} />

      {/* Sección "Organizaciones por validación" (Requisito 1) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <ClipboardList className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Organizaciones por Validación
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento de organizaciones con RUT en cola de verificación o pendientes de completar registro
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('solicitudes')}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Gestionar cola de RUT</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Resumen numérico del endpoint /admin/estadisticas/organizaciones-por-validacion */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Pendientes Validación RUT
            </span>
            <span className="text-2xl font-black text-amber-900 mt-1 block">
              {pendientesValidacionRut}
            </span>
            <span className="text-[10px] text-amber-700">Esperando revisión administrativa</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Sin RUT Cargado
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {sinRutCount}
            </span>
            <span className="text-[10px] text-slate-500">En pre-registro (sin documento)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Aprobadas y Verificadas
            </span>
            <span className="text-2xl font-black text-emerald-900 mt-1 block">
              {aprobadasCount}
            </span>
            <span className="text-[10px] text-emerald-700">Habilitadas para publicar</span>
          </div>
        </div>

        {/* Lista representativa de organizaciones en espera */}
        <div className="space-y-3">
          {orgsRequierenAtencion.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
              No hay organizaciones con validación pendiente en este momento.
            </div>
          ) : (
            orgsRequierenAtencion.slice(0, 5).map((org) => {
              const isRechazada = org.estado === 'RECHAZADA';
              const isSuspendida = org.estado === 'SUSPENDIDA' || isRechazada;

              return (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 shrink-0">
                      {(org.razonSocial || org.nombre)?.charAt(0) || 'O'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {org.razonSocial || org.nombre}
                        </p>
                        <Badge
                          variant={isSuspendida ? 'danger' : 'warning'}
                          size="xs"
                        >
                          {isRechazada ? 'SUSPENDIDA (RUT RECHAZADO)' : org.estado || 'PENDIENTE'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        NIT: {org.nit || 'En verificación'} • Rep: {org.representante || '—'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => (onVerOrganizacion ? onVerOrganizacion(org) : onNavigateTab('solicitudes'))}
                    className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0 ml-2"
                    title="Ver detalle"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
