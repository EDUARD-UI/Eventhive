import React, { useState, useEffect } from 'react';
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
          const raw = eventsRes.value.data;
          const list = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.content)
              ? raw.content
              : Array.isArray(raw?.data)
                ? raw.data
                : [];
          setTopEventos(list.slice(0, 5));
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

  // Cálculo de máximos para barras de peso relativo proporcional
  const maxEventSales = Math.max(1, ...topEventos.map((e) => Number(e.totalVentas || 0)));
  const maxOrgSales = Math.max(1, ...topOrganizaciones.map((o) => Number(o.totalVentas || 0)));

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* 1. Encabezado Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            MÉTRICAS COMERCIALES · CONSOLA FINANCIERA
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Ingresos brutos de plataforma, comisiones de boletaje y pagos de campañas de promoción.
          </p>
        </div>
      </div>

      {/* 2. Barra Superior Financiera (Bloque Unificado de 3 Columnas) */}
      <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0]">
          {/* Columna 1: Venta Bruta Total */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              VENTA BRUTA TOTAL
            </span>
            <div className="font-mono font-black text-2xl sm:text-3xl text-[#0F2342] tracking-tight">
              {loading ? '—' : formatPrice(ventaBrutaTotal)}
            </div>
            <span className="font-mono text-[10px] text-[#64748B] uppercase">
              Boletaje + Pagos de Promoción
            </span>
          </div>

          {/* Columna 2: Comisiones de EventHive (Resaltado con línea inferior de 3px en #F5B800) */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-2 relative border-b-4 md:border-b-0 border-b-[#F5B800]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#0F2342] font-bold">
                COMISIONES DE EVENTHIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
            </div>
            <div className="font-mono font-black text-2xl sm:text-3xl text-[#0F2342] tracking-tight">
              {loading ? '—' : formatPrice(comisionesVentas)}
            </div>
            {/* Barra láser inferior en escritorio */}
            <div className="hidden md:block absolute bottom-0 left-0 right-0 h-[3px] bg-[#F5B800]" />
            <span className="font-mono text-[10px] text-[#B45309] uppercase font-bold">
              Margen de intermediación oficial
            </span>
          </div>

          {/* Columna 3: Ingresos por Pago de Promoción */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              INGRESOS POR PAGO DE PROMOCIÓN
            </span>
            <div className="font-mono font-black text-2xl sm:text-3xl text-[#0F2342] tracking-tight">
              {loading ? '—' : formatPrice(ingresosPagoPromocion)}
            </div>
            <span className="font-mono text-[10px] text-[#64748B] uppercase">
              Planes publicitarios activos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Rankings Inferiores (2 Columnas con numeración grande y barras proporcionales sutiles) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking 1: Eventos con más ventas */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
              <span>EVENTOS CON MÁS VENTAS</span>
            </span>
            <span className="font-mono text-[10px] text-[#64748B] uppercase">TOP 5 CARTELERA</span>
          </div>

          <div className="space-y-3">
            {loading && topEventos.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-[#64748B]">
                Cargando métricas de eventos...
              </div>
            ) : topEventos.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-[#64748B]">
                No hay ventas confirmadas registradas en el período.
              </div>
            ) : (
              topEventos.map((ev, index) => {
                const total = Number(ev.totalVentas || 0);
                const percent = Math.min(100, Math.round((total / maxEventSales) * 100));
                const pos = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={ev.eventoId || ev.id || index}
                    className="relative overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 flex items-center justify-between"
                  >
                    {/* Barra proporcional sutil de peso detrás de cada fila */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#0F2342]/[0.04] pointer-events-none transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Contenido frontal */}
                    <div className="relative z-10 flex items-center gap-3.5 min-w-0 pr-3">
                      <span className="font-mono font-black text-lg text-[#0F2342]/40 shrink-0">
                        {pos}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F2342] truncate">
                          {ev.nombre || ev.titulo}
                        </h4>
                        <p className="font-mono text-[11px] text-[#64748B] truncate mt-0.5">
                          {ev.organizacion || 'Organización'} ·{' '}
                          {ev.entradasVendidas || ev.ticketsVendidos || 0} boletas vendidas
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-[#0F2342] block">
                        {formatPrice(total)}
                      </span>
                      <span className="font-mono text-[10px] text-[#15803D] uppercase font-bold">
                        CONFIRMADO
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Ranking 2: Organizaciones con más ventas */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#0F2342] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F2342]" />
              <span>ORGANIZACIONES CON MÁS VENTAS</span>
            </span>
            <span className="font-mono text-[10px] text-[#64748B] uppercase">TOP 5 ENTIDADES</span>
          </div>

          <div className="space-y-3">
            {loading && topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-[#64748B]">
                Cargando ranking de organizaciones...
              </div>
            ) : topOrganizaciones.length === 0 ? (
              <div className="py-8 text-center font-mono text-xs text-[#64748B]">
                No hay ventas de organizaciones registradas en el período.
              </div>
            ) : (
              topOrganizaciones.map((org, index) => {
                const total = Number(org.totalVentas || 0);
                const percent = Math.min(100, Math.round((total / maxOrgSales) * 100));
                const pos = String(index + 1).padStart(2, '0');

                return (
                  <div
                    key={org.organizacionId || org.id || index}
                    className="relative overflow-hidden rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-3.5 flex items-center justify-between"
                  >
                    {/* Barra proporcional sutil detrás */}
                    <div
                      className="absolute inset-y-0 left-0 bg-[#F5B800]/[0.08] pointer-events-none transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />

                    {/* Contenido frontal */}
                    <div className="relative z-10 flex items-center gap-3.5 min-w-0 pr-3">
                      <span className="font-mono font-black text-lg text-[#0F2342]/40 shrink-0">
                        {pos}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-xs sm:text-sm text-[#0F2342] truncate">
                          {org.razonSocial || org.nombre}
                        </h4>
                        <p className="font-mono text-[11px] text-[#64748B] truncate mt-0.5">
                          {org.entradasVendidas
                            ? `${org.entradasVendidas} entradas vendidas`
                            : org.nit
                            ? `NIT: ${org.nit}`
                            : 'Organización Oficial'}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 text-right shrink-0">
                      <span className="font-mono font-bold text-sm text-[#0F2342] block">
                        {formatPrice(total)}
                      </span>
                      <span className="font-mono text-[10px] text-[#64748B] uppercase font-bold">
                        VENTAS TOTALES
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
