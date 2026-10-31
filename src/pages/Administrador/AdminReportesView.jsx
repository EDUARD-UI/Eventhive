import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Calendar,
  Percent,
  Award,
} from 'lucide-react';
import adminService from '../../features/admin/services/adminService.js';
import { formatPrice } from '../../utils/formatters.js';

export default function AdminReportesView({
  commercialMetrics = {},
  organizaciones = [],
  eventos = [],
}) {
  const [topEventos, setTopEventos] = useState([]);
  const [topOrganizaciones, setTopOrganizaciones] = useState([]);
  const [ingresosData, setIngresosData] = useState({
    ventaBrutaTotal: 0,
    comisionesVentas: 0,
    ingresosPagoPromocion: 0,
  });
  const [loading, setLoading] = useState(false);

  // Consumir endpoints reales del backend:
  // 1. GET /api/admin/estadisticas/ingresos-plataforma
  // 2. GET /api/admin/estadisticas/top-eventos-ventas
  // 3. GET /api/admin/estadisticas/top-organizaciones-ventas
  useEffect(() => {
    let isMounted = true;
    async function loadCommercialData() {
      try {
        setLoading(true);
        const [ingresosRes, eventsRes, orgsRes] = await Promise.allSettled([
          adminService.getIngresosPlataforma(),
          adminService.getTopEventosVentas(),
          adminService.getTopOrganizacionesVentas(),
        ]);
        if (!isMounted) return;

        if (ingresosRes.status === 'fulfilled' && ingresosRes.value?.data) {
          setIngresosData(ingresosRes.value.data);
        } else if (commercialMetrics?.ventaBrutaTotal != null) {
          setIngresosData({
            ventaBrutaTotal: commercialMetrics.ventaBrutaTotal || 0,
            comisionesVentas: commercialMetrics.comisionesVentas || 0,
            ingresosPagoPromocion: commercialMetrics.ingresosPagoPromocion || 0,
          });
        }

        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          // Mostrar únicamente eventos publicados devueltos por el backend
          const list = eventsRes.value.data;
          setTopEventos(Array.isArray(list) ? list.slice(0, 5) : []);
        } else if (commercialMetrics?.topEventos) {
          setTopEventos(commercialMetrics.topEventos.slice(0, 5));
        }

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.data) {
          const list = orgsRes.value.data;
          const organizations = Array.isArray(list)
            ? list
            : Array.isArray(list?.content)
              ? list.content
              : Array.isArray(list?.data)
                ? list.data
                : [];
          setTopOrganizaciones(organizations.slice(0, 5));
        } else if (commercialMetrics?.topOrganizaciones) {
          setTopOrganizaciones(commercialMetrics.topOrganizaciones.slice(0, 5));
        }
      } catch (err) {
        console.warn('Error al cargar datos comerciales:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCommercialData();
    return () => {
      isMounted = false;
    };
  }, [commercialMetrics]);

  const ventaBrutaTotal = ingresosData.ventaBrutaTotal || commercialMetrics?.ventaBrutaTotal || 0;
  const comisionesVentas = ingresosData.comisionesVentas || commercialMetrics?.comisionesVentas || 0;
  const ingresosPagoPromocion = ingresosData.ingresosPagoPromocion || commercialMetrics?.ingresosPagoPromocion || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" strokeWidth={1.75} />
            <span>Panel de Métricas Comerciales</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresos oficiales de plataforma, comisiones de ticketing y recaudos por promoción confirmados.
          </p>
        </div>
      </div>

      {/* Tarjetas Principales de Métricas Comerciales (Requerimiento 10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Venta bruta total
              </span>
              <div className="p-2.5 rounded-xl bg-blue-50 text-brand">
                <DollarSign className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {formatPrice(ventaBrutaTotal)}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Ventas brutas de boletas + pagos de promociones</span>
          </span>
        </div>

        {/* 10.2. Comisiones de EventHive */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Comisiones de EventHive
              </span>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Percent className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {formatPrice(comisionesVentas)}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comisiones comerciales obtenidas de ventas de boletas</span>
          </span>
        </div>

        {/* 10.3. Ingresos por pago de promoción */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ingresos por pago de promoción
              </span>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {formatPrice(ingresosPagoPromocion)}
            </div>
          </div>
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Pagos de promoción confirmados por el sistema</span>
          </span>
        </div>
      </div>

      {/* Grid de Rankings Oficiales: Top 5 Eventos y Top 5 Organizaciones (Requerimiento 10.5 y 10.6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 10.5. Eventos con más ventas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Eventos con más ventas
                </h3>
                <p className="text-[11px] text-slate-400">
                  Eventos publicados con mayor volumen de ventas confirmadas
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading && topEventos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando eventos con más ventas...
              </div>
            ) : topEventos.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay ventas confirmadas de eventos registradas actualmente.
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
                        {ev.organizacion || 'Organización'} • {ev.entradasVendidas || ev.ticketsVendidos || 0} boletas vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-slate-900 block">
                      {formatPrice(ev.totalVentas || 0)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Confirmado
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 10.6. Organizaciones con más ventas */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Building2 className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Organizaciones con más ventas
                </h3>
                <p className="text-[11px] text-slate-400">
                  Ranking de organizaciones según volumen comercial registrado
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {loading && topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Cargando ranking de organizaciones...
              </div>
            ) : topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay ventas de organizaciones registradas actualmente.
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
                      {formatPrice(org.totalVentas || 0)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Ventas de eventos
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
