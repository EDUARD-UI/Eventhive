import React from 'react';
import {
  Building2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  Ban,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import PlatformMetricsChart from '../../components/componentsAdmin/PlatformMetricsChart.jsx';

export default function AdminResumenView({
  metrics,
  commercialMetrics,
  organizaciones = [],
  eventosPorEstado = [],
  eventosPorCategoria = [],
  organizacionesPorValidacion = null,
  onNavigateTab,
  onVerOrganizacion,
}) {
  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

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

  const getEventCount = (estadoName) => {
    if (Array.isArray(eventosPorEstado) && eventosPorEstado.length > 0) {
      const found = eventosPorEstado.find(
        (e) => e.estado?.toUpperCase() === estadoName.toUpperCase()
      );
      if (found) return found.cantidad;
    }
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0F2342] font-display">
            RESUMEN GLOBAL DE PLATAFORMA
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión integral de organizaciones, validaciones de RUT, métricas comerciales y actividad en Event Hive.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('organizaciones')}
            className="px-3.5 py-2 rounded-[2px] bg-[#0F2342] text-white hover:bg-[#F5B800] hover:text-[#0F2342] font-mono text-xs font-bold tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>ORGANIZACIONES</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('solicitudes')}
            className="px-3.5 py-2 rounded-[2px] border border-[#0F2342] bg-white text-[#0F2342] hover:bg-[#0F2342] hover:text-white font-mono text-xs font-bold tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>VALIDAR RUT</span>
          </button>
        </div>
      </div>

      {/* Barra de Indicadores Agregados Unificada */}
      <div className="bg-white border border-[#E2E8F0] rounded-[2px] p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
        <div className="px-3 py-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
            ORGANIZACIONES
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-[#0F2342]">{totalOrgs}</span>
            <span className="font-mono text-[10px] text-[#15803D] font-bold">
              {aprobadasCount} activas
            </span>
          </div>
        </div>

        <div className="px-3 py-1 pt-3 md:pt-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
            RUT PENDIENTE VALIDACIÓN
          </span>
          <div className="mt-1">
            <span className="font-mono text-2xl font-bold text-[#D97706]">{pendientesValidacionRut}</span>
            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">En cola de revisión</span>
          </div>
        </div>

        <div className="px-3 py-1 pt-3 md:pt-1">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
            SIN RUT REGISTRADO
          </span>
          <div className="mt-1">
            <span className="font-mono text-2xl font-bold text-[#DC2626]">{sinRutCount}</span>
            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">Carga pendiente</span>
          </div>
        </div>

        <div className="px-3 py-1 pt-3 md:pt-1 border-b-2 border-b-[#F5B800]">
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
            COMISIONES DE EVENT HIVE
          </span>
          <div className="mt-1">
            <span className="font-mono text-2xl font-bold text-[#0F2342]">
              {formatCOP(commercialMetrics?.comisionesVentas ?? metrics?.comisionesVentas ?? 0)}
            </span>
            <span className="font-mono text-[10px] text-[#15803D] block font-bold mt-0.5">Ventas directas</span>
          </div>
        </div>
      </div>

      {/* Desglose Detallado: Estado de Organizaciones y Estado de Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Desglose Organizaciones */}
        <div className="p-4 rounded-[2px] bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
            <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0F2342]" />
              <span>ESTADO DE ORGANIZACIONES</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('organizaciones')}
              className="font-mono text-[11px] font-bold text-[#0F2342] hover:text-[#F5B800] transition-colors inline-flex items-center gap-1"
            >
              <span>VER TODAS</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Aprobadas</span>
              <span className="font-mono text-xl font-bold text-[#15803D]">{aprobadasCount}</span>
            </div>
            <div className="p-3 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-1">En Revisión</span>
              <span className="font-mono text-xl font-bold text-[#D97706]">{pendientesValidacionRut}</span>
            </div>
            <div className="p-3 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Suspendidas</span>
              <span className="font-mono text-xl font-bold text-[#DC2626]">{suspendidasCount}</span>
            </div>
          </div>
        </div>

        {/* Desglose Estados de Eventos */}
        <div className="p-4 rounded-[2px] bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
            <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0F2342]" />
              <span>ESTADOS DE EVENTOS</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-500">
              TOTAL: {metrics?.totalEventos || 0}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-[#15803D] uppercase block truncate">Publicados</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('PUBLICADO')}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-[#D97706] uppercase block truncate">Revisión</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('PENDIENTE_REVISION')}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-[#0F2342] uppercase block truncate">Corrección</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('EN_CORRECCION')}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase block truncate">Finalizados</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('FINALIZADO')}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-slate-500 uppercase block truncate">Cancelados</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('CANCELADO')}</span>
            </div>
            <div className="p-2 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0]">
              <span className="font-mono text-[9px] font-bold text-[#DC2626] uppercase block truncate">Suspendidos</span>
              <span className="font-mono text-base font-bold text-[#0F2342] mt-0.5 block">{getEventCount('SUSPENDIDO')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Organizaciones con más ventas */}
      <div className="p-4 rounded-[2px] bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
          <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#0F2342]" />
            <span>ORGANIZACIONES CON MÁS VENTAS</span>
          </span>
          <button
            type="button"
            onClick={() => onNavigateTab('reportes')}
            className="font-mono text-[11px] font-bold text-[#0F2342] hover:text-[#F5B800] transition-colors inline-flex items-center gap-1"
          >
            <span>VER REPORTES COMPLETOS</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        {Array.isArray(commercialMetrics?.topOrganizaciones) && commercialMetrics.topOrganizaciones.length > 0 ? (
          <div className="space-y-2">
            {commercialMetrics.topOrganizaciones.slice(0, 5).map((org, index) => (
              <div
                key={org.organizacionId || org.id || index}
                className="flex items-center justify-between gap-3 rounded-[2px] bg-[#F8F9FA] border border-[#E2E8F0] px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-400">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-[#0F2342]">
                      {org.razonSocial || org.nombre || 'Organización'}
                    </p>
                    <p className="font-mono text-[10px] text-slate-500">
                      {Number(org.entradasVendidas || 0)} ENTRADAS VENDIDAS
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs font-bold text-[#0F2342]">
                  {formatCOP(org.totalVentas)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center font-mono text-xs text-slate-400">
            No hay ventas de organizaciones registradas actualmente.
          </p>
        )}
      </div>

      {/* Gráfica de Eventos por Categoría */}
      <PlatformMetricsChart eventosPorCategoria={eventosPorCategoria} />
    </div>
  );
}