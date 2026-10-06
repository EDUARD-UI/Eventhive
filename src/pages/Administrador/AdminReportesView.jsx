import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Ticket,
  Building2,
  Calendar,
  Download,
  Info,
  Percent,
} from 'lucide-react';
import AdminInfoAlert from '../../components/componentsAdmin/AdminInfoAlert.jsx';
import adminService from '../../features/admin/services/adminService.js';
import Swal from 'sweetalert2';

export default function AdminReportesView({
  commercialMetrics = {},
  organizaciones = [],
  eventos = [],
}) {
  const [periodo, setPeriodo] = useState('mes');
  const [topEventos, setTopEventos] = useState([]);
  const [topOrganizaciones, setTopOrganizaciones] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatCOP = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val || 0);

  // Consumir los dos endpoints del backend para Top 5 eventos y Top 5 organizaciones (Requisito 4)
  useEffect(() => {
    let isMounted = true;
    async function loadTopMetrics() {
      try {
        setLoading(true);
        const [eventsRes, orgsRes] = await Promise.allSettled([
          adminService.getTopEventosVentas(),
          adminService.getTopOrganizacionesVentas(),
        ]);
        if (!isMounted) return;

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          setTopEventos(eventsRes.value.data.slice(0, 5));
        } else if (commercialMetrics?.topEventos) {
          setTopEventos(commercialMetrics.topEventos.slice(0, 5));
        }

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.data) {
          setTopOrganizaciones(orgsRes.value.data.slice(0, 5));
        } else if (commercialMetrics?.topOrganizaciones) {
          setTopOrganizaciones(commercialMetrics.topOrganizaciones.slice(0, 5));
        }
      } catch (err) {
        console.warn('Error al cargar top comercial:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTopMetrics();
    return () => {
      isMounted = false;
    };
  }, [commercialMetrics]);

  // Cálculos consolidados
  const totalVentasEventos = topEventos.reduce((acc, curr) => acc + (curr.totalVentas || 0), 0);
  const totalEntradasEventos = topEventos.reduce((acc, curr) => acc + (curr.entradasVendidas || 0), 0);

  const ventasBrutas = commercialMetrics?.ventasPeriodo || commercialMetrics?.ventasTotales || totalVentasEventos || 0;
  const comisionPlataforma = commercialMetrics?.ingresosPlataforma || (ventasBrutas > 0 ? Math.round(ventasBrutas * 0.09) : 0);
  const ingresoOrgs = commercialMetrics?.ingresoOrganizaciones || (ventasBrutas > 0 ? ventasBrutas - comisionPlataforma : 0);
  const ticketsVendidos = commercialMetrics?.ticketsVendidos || totalEntradasEventos || 0;
  const ticketPromedio = ticketsVendidos > 0 ? Math.round(ventasBrutas / ticketsVendidos) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Alerta Informativa Inicial (Requisito 10) */}
      <AdminInfoAlert
        id="reportes"
        title="Métricas Comerciales y Liquidación"
        description="Consulta los reportes consolidados de facturación, venta bruta, comisiones de Eventhive (9%) e ingresos transferibles a las organizaciones productoras."
      />

      {/* Encabezado y Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Métricas Comerciales de la Plataforma</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Indicadores de rendimiento de ventas, tickets emitidos y liquidación
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Últimos 7 días</option>
            <option value="mes">Mes Actual</option>
            <option value="trimestre">Trimestre Actual</option>
            <option value="anio">Año Vigente</option>
          </select>

          <button
            type="button"
            onClick={() =>
              Swal.fire({
                icon: 'info',
                title: 'Generando informe',
                text: 'Generando informe consolidado de ventas...',
                timer: 2000,
                showConfirmButton: false,
              })
            }
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>

      {/* Tarjetas Principales de Métricas Comerciales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Venta Bruta */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Venta Bruta Total
            </span>
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {formatCOP(ventasBrutas)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Recaudo registrado</span>
          </span>
        </div>

        {/* Comisión EventHive */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Comisión EventHive (9%)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Percent className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-900 mb-1">
            {formatCOP(comisionPlataforma)}
          </div>
          <span className="text-[11px] text-slate-400">
            Ingreso por servicio de ticketing
          </span>
        </div>

        {/* Ingreso Organizaciones */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Ingreso Organizaciones (91%)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mb-1">
            {formatCOP(ingresoOrgs)}
          </div>
          <span className="text-[11px] text-slate-400">
            Fondos transferibles a productores
          </span>
        </div>

        {/* Tickets y Ticket Promedio */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
              Tickets Emitidos
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Ticket className="w-4 h-4" strokeWidth={1.75} />
            </div>
          </div>
          <div className="text-2xl font-black text-violet-900 mb-1">
            {ticketsVendidos.toLocaleString('es-CO')}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Ticket promedio: {formatCOP(ticketPromedio)}
          </span>
        </div>
      </div>

      {/* Grid de 2 Tablas: Top 5 Eventos y Top 5 Organizaciones (Requisito 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Eventos con Mayores Ventas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top 5 Eventos con Más Ventas
                </h3>
                <p className="text-[11px] text-slate-400">
                  Consumiendo endpoint /api/admin/estadisticas/top-eventos-ventas
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading && topEventos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando top eventos con más ventas...
              </div>
            ) : topEventos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay ventas de eventos registradas en este período.
              </div>
            ) : (
              topEventos.map((ev, index) => (
                <div
                  key={ev.eventoId || ev.id || index}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {ev.nombre || ev.titulo}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {ev.organizacion || 'Organización'} • {ev.entradasVendidas || ev.ticketsVendidos || 0} entradas
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-slate-900 block">
                      {formatCOP(ev.totalVentas)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Comisión: {formatCOP((ev.totalVentas || 0) * 0.09)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Organizaciones con Mayores Ventas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top 5 Organizaciones con Más Ventas
                </h3>
                <p className="text-[11px] text-slate-400">
                  Consumiendo endpoint /api/admin/estadisticas/top-organizaciones-ventas
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading && topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando top organizaciones con más ventas...
              </div>
            ) : topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay ventas de organizaciones registradas en este período.
              </div>
            ) : (
              topOrganizaciones.map((org, index) => (
                <div
                  key={org.organizacionId || org.id || index}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {org.razonSocial || org.nombre}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {org.entradasVendidas ? `${org.entradasVendidas} entradas vendidas` : org.nit ? `NIT: ${org.nit}` : 'Organización'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-slate-900 block">
                      {formatCOP(org.totalVentas)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Neto: {formatCOP((org.totalVentas || 0) * 0.91)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
