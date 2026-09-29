import React from 'react';
import {
  Users,
  Building2,
  Calendar,
  Ticket,
  DollarSign,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import PlatformMetricsChart from '../../components/componentsAdmin/PlatformMetricsChart.jsx';

export default function AdminResumenView({
  metrics,
  commercialMetrics,
  organizaciones = [],
  eventos = [],
  auditLogs = [],
  onNavigateTab,
  onVerOrganizacion,
  onVerEvento,
}) {
  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Solicitudes / Organizaciones que requieren atención
  const orgsPendientes = organizaciones.filter((o) => o.estado === 'PENDIENTE');
  const orgsSuspendidas = organizaciones.filter((o) => o.estado === 'SUSPENDIDA');
  const eventosPendientes = eventos.filter((e) => e.estado === 'EN_REVISION' || e.estado === 'PENDIENTE');

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-primary-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.75} />
            <span>Centro de Control Administrativo • Cartagena de Indias</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Panel de Supervisión Global
          </h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl leading-relaxed">
            Monitoreo en tiempo real de organizaciones, eventos, métricas comerciales y auditoría de la plataforma Event Hive.
          </p>
        </div>

        {/* Acciones Rápidas en Header */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigateTab('organizaciones')}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <span>Gestionar Organizaciones</span>
          </button>
          <button
            onClick={() => onNavigateTab('eventos')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 backdrop-blur-sm transition-all active:scale-95 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
            <span>Supervisar Eventos</span>
          </button>
        </div>
      </div>

      {/* SECCIÓN 4: 14 Indicadores Agregados de la Plataforma */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <span>Indicadores Agregados de Plataforma</span>
            </h2>
            <p className="text-xs text-slate-500">
              Consultas agregadas para rendimiento óptimo del backend (Sección 4 de especificación)
            </p>
          </div>
        </div>

        {/* Grid de 4 KPIs Macro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <StatCard
            title="Total Usuarios"
            value={(metrics?.totalUsuarios || 0).toLocaleString('es-CO')}
            subtitle="Compradores y creadores registrados"
            icon={Users}
            color="primary"
          />
          <StatCard
            title="Total Organizaciones"
            value={metrics?.totalOrganizaciones || 0}
            subtitle={`${metrics?.organizacionesAprobadas || 0} verificadas • ${metrics?.solicitudesVerificacionPendientes || 0} pendientes`}
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
            title="Ventas Totales Brutas"
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
                  <span>Verificadas</span>
                </div>
                <div className="text-lg font-black text-emerald-800">
                  {metrics?.organizacionesAprobadas || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-center gap-1 text-amber-700 text-xs font-semibold mb-0.5">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  <span>Pendientes RUT</span>
                </div>
                <div className="text-lg font-black text-amber-800">
                  {metrics?.solicitudesVerificacionPendientes || 0}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
                <div className="flex items-center justify-center gap-1 text-rose-700 text-xs font-semibold mb-0.5">
                  <Ban className="w-3 h-3" strokeWidth={2} />
                  <span>Suspendidas</span>
                </div>
                <div className="text-lg font-black text-rose-800">
                  {metrics?.organizacionesSuspendidas || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Desglose Eventos de la Plataforma */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                <span>Estado de Eventos en Plataforma</span>
              </span>
              <button
                onClick={() => onNavigateTab('eventos')}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Supervisar</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-700 block">Publicados</span>
                <span className="text-base font-black text-emerald-800">
                  {metrics?.eventosPublicados || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block">En Revisión</span>
                <span className="text-base font-black text-amber-800">
                  {metrics?.eventosPendientesRevision || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block">Corrección</span>
                <span className="text-base font-black text-blue-800">
                  {metrics?.eventosEnCorreccion || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 block">Finalizados</span>
                <span className="text-base font-black text-slate-800">
                  {metrics?.eventosFinalizados || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 block">Cancelados</span>
                <span className="text-base font-black text-slate-800">
                  {metrics?.eventosCancelados || 0}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100">
                <span className="text-[10px] font-bold text-rose-700 block">Suspendidos</span>
                <span className="text-base font-black text-rose-800">
                  {metrics?.eventosSuspendidos || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfica de Distribución Geográfica y Volumen */}
      <PlatformMetricsChart />

      {/* Grid de 2 Columnas: Atención Inmediata & Registro de Auditoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Organizaciones que requieren supervisión */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Organizaciones Bajo Supervisión
                </h3>
                <p className="text-xs text-slate-500">
                  Organizaciones suspendidas o con observaciones administrativas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('organizaciones')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-3">
            {orgsSuspendidas.length === 0 && orgsPendientes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No hay organizaciones con incidencias administrativas activas.
              </div>
            ) : (
              [...orgsSuspendidas, ...orgsPendientes.slice(0, 2)].map((org) => (
                <div
                  key={org.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm border border-slate-200 shrink-0">
                      {org.nombre?.charAt(0) || 'O'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {org.nombre}
                        </p>
                        <Badge
                          variant={org.estado === 'SUSPENDIDA' ? 'danger' : 'warning'}
                          size="xs"
                        >
                          {org.estado}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        NIT: {org.nit} • Rep: {org.representante}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onVerOrganizacion(org)}
                    className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-white border border-transparent hover:border-slate-200 transition-all shrink-0 ml-2"
                    title="Ver perfil administrativo"
                  >
                    <ExternalLink className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Auditoría e Historial Reciente */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <FileCheck className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Trazabilidad y Auditoría
                </h3>
                <p className="text-xs text-slate-500">
                  Últimas acciones administrativas registradas
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('historial')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver registro completo
            </button>
          </div>

          <div className="space-y-3">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {log.accion}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {log.fecha}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                    {log.entidad}: <span className="font-semibold">{log.entidadNombre}</span> — {log.detalles}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ejecutado por: <span className="text-slate-600 font-medium">{log.usuarioNombre}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
