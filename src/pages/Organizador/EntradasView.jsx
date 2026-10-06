import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiTag,
  FiCalendar,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice } from '../../utils/formatters.js';

export default function EntradasView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalElements, setTotalElements] = useState(0);

  // Estadísticas oficiales del endpoint (GET /api/organizaciones/mi-organizacion/estadisticas)
  const [estadisticas, setEstadisticas] = useState({
    totalBoletasVendidas: 0,
    totalIngresos: 0,
    eventos: [],
  });

  // Cargar estadísticas oficiales del endpoint
  useEffect(() => {
    let isMounted = true;
    organizerService
      .getEstadisticasMiOrganizacion()
      .then((data) => {
        if (!isMounted || !data) return;
        const lista = data.eventos || data.estadisticasEventos || data.listaEventos || [];
        setEstadisticas({
          totalBoletasVendidas: data.totalBoletasVendidas ?? data.boletasVendidas ?? 0,
          totalIngresos: data.totalIngresos ?? data.ingresosTotales ?? 0,
          eventos: Array.isArray(lista) ? lista : [],
        });
      })
      .catch((err) => {
        console.warn('No se pudo cargar estadísticas de entradas:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar eventos paginados con localidades
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    organizerService
      .getEventosOrganizadorPaginated({ page: currentPage - 1, size: pageSize })
      .then((data) => {
        if (!isMounted) return;
        const content = data?.content || [];
        setEvents(content);
        setTotalElements(data?.totalElements || 0);
      })
      .catch(() => {
        if (isMounted) setEvents([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, pageSize]);

  // Si el endpoint de estadísticas devolvió eventos, usarlos; si no, calcular de los eventos cargados
  const eventosGanancias = useMemo(() => {
    if (estadisticas.eventos.length > 0) {
      return estadisticas.eventos.map((ev, idx) => ({
        key: `ev-stat-${idx}`,
        titulo: ev.titulo || ev.nombre || ev.nombreEvento || 'Evento',
        boletasVendidas: ev.boletasVendidas ?? ev.totalBoletasVendidas ?? 0,
        ingresosGenerados: ev.ingresosGenerados ?? ev.totalIngresos ?? ev.ingresos ?? 0,
        estado: ev.estado || 'PUBLICADO',
      }));
    }

    return events.map((ev) => {
      let vendidas = 0;
      let ingresos = 0;
      if (ev.localidades) {
        ev.localidades.forEach((loc) => {
          const v = Math.max(0, (loc.capacidad || 0) - (loc.disponibles || 0));
          vendidas += v;
          ingresos += v * (loc.precio || 0);
        });
      }
      return {
        key: `ev-${ev.id}`,
        titulo: ev.titulo,
        boletasVendidas: vendidas,
        ingresosGenerados: ingresos,
        estado: ev.estado,
      };
    });
  }, [estadisticas.eventos, events]);

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

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Gestión de Entradas y Ganancias
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xl">
          Visualiza las ventas de boletos por evento y los ingresos brutos generados por tu organización entregados por el backend.
        </p>
      </div>

      {/* 2. KPIs de Entradas y Ganancias Brutas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Total Boletas Vendidas"
          value={estadisticas.totalBoletasVendidas.toLocaleString('es-CO')}
          change="Boletas totales vendidas registradas en backend"
          trend="up"
          icon={FiCreditCard}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Ingresos Brutos Totales"
          value={formatPrice(estadisticas.totalIngresos)}
          change="Recaudo bruto oficial entregado por el backend"
          trend="up"
          icon={FiDollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Tabla de Ganancias e Ingresos por Evento (Requerimiento: ubicado en Entradas) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-black text-slate-900">
              Ganancias y Boletas por Evento
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Datos entregados por el endpoint de estadísticas de tu organización.
            </p>
          </div>
          <Badge variant="primary" size="md">
            Ingresos Brutos
          </Badge>
        </div>

        {eventosGanancias.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
            No hay registros de ventas para tus eventos aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3 px-4">Nombre del Evento</th>
                  <th className="py-3 px-4 text-center">Boletas Vendidas</th>
                  <th className="py-3 px-4 text-right">Ingresos Generados (Bruto)</th>
                  <th className="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {eventosGanancias.map((ev) => (
                  <tr key={ev.key} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {ev.titulo}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {ev.boletasVendidas.toLocaleString('es-CO')} boletas
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-700 text-sm">
                      {formatPrice(ev.ingresosGenerados)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge tone={toneMap[ev.estado] || 'neutral'}>
                        {ev.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Tarjetas de Detalle por Localidad */}
      <div>
        <h3 className="font-display text-base font-black text-slate-900 mb-3">
          Desglose por Localidades y Aforos
        </h3>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Cargando localidades...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="font-display text-base font-bold text-slate-800">
              No hay eventos con entradas configuradas
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Publica un evento con localidades para ver la información aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {events.map((event) => {
                const localidades = event.localidades || [];

                return (
                  <article
                    key={event.id}
                    className="group rounded-2xl border border-slate-200/85 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Event name */}
                      <h4 className="font-display text-base font-bold text-slate-900 group-hover:text-brand transition-colors mb-1 truncate">
                        {event.titulo}
                      </h4>
                      {event.categoria?.nombre && (
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-3">
                          {event.categoria.nombre}
                        </span>
                      )}

                      {/* Localidades */}
                      <div className="mt-2 space-y-2.5">
                        {localidades.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">Sin localidades configuradas</p>
                        ) : (
                          localidades.map((loc, lIdx) => {
                            const vendidas = Math.max(0, (loc.capacidad || 0) - (loc.disponibles || 0));
                            const total = loc.capacidad || 0;
                            const pct = total > 0 ? Math.round((vendidas / total) * 100) : 0;

                            return (
                              <div key={loc.id || lIdx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-xs text-slate-900">{loc.nombre}</span>
                                  <span className="font-bold text-xs text-brand">
                                    {loc.precio === 0 ? 'Gratis' : formatPrice(loc.precio)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="text-slate-600">
                                    Vendidas: <strong className="text-slate-900">{vendidas}</strong> / {total}
                                  </span>
                                  <span className="font-bold text-slate-700">{pct}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-brand h-1.5 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {totalElements > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalElements}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                pageSizeOptions={[6]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
