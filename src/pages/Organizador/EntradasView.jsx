import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';

export default function EntradasView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch paginated events from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    organizerService.getEventosOrganizadorPaginated({ page: currentPage - 1, size: pageSize })
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
    return () => { isMounted = false; };
  }, [currentPage, pageSize]);

  // Global metrics from loaded events (calculated from all org events for summary)
  const [globalStats, setGlobalStats] = useState({ vendidas: 0, ingresos: 0 });
  useEffect(() => {
    organizerService.getEventosOrganizador({ page: 0, size: 500 })
      .then((allEvents) => {
        const list = allEvents || [];
        let totalVendidas = 0;
        let totalIngresos = 0;
        list.forEach((ev) => {
          if (ev.localidades) {
            ev.localidades.forEach((loc) => {
              const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
              totalVendidas += vendidas;
              totalIngresos += vendidas * (loc.precio || 0);
            });
          }
        });
        setGlobalStats({ vendidas: totalVendidas, ingresos: totalIngresos });
      })
      .catch(() => {});
  }, []);

  const formatCurrency = (amount) => {
    if (amount === 0) return 'Gratis';
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M COP`;
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Gestión de Entradas
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xl">
          Visualiza las ventas de boletos por evento y los ingresos generados por tu organización.
        </p>
      </div>

      {/* 2. KPIs — item 6: solo boletas vendidas e ingresos (no ticket promedio, no comisión) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Boletas Vendidas"
          value={globalStats.vendidas.toLocaleString('es-CO')}
          change="Total de boletas vendidas por la organización"
          trend="up"
          icon={FiCreditCard}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Ingresos Generados"
          value={formatCurrency(globalStats.ingresos)}
          change="Total recaudado por ventas"
          trend="up"
          icon={FiDollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* 3. Cards por evento — item 6: nombre, localidades, precio, vendidas, barra de progreso */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando entradas...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="font-display text-base font-bold text-slate-800">
            No hay eventos con entradas
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Publica un evento con localidades para ver información de entradas aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {events.map((event) => {
              const localidades = event.localidades || [];
              const eventVendidas = localidades.reduce((sum, loc) => {
                return sum + ((loc.capacidad || 0) - (loc.disponibles || 0));
              }, 0);

              return (
                <article
                  key={event.id}
                  className="group rounded-2xl border border-slate-200/85 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Event name */}
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-brand transition-colors mb-1">
                      {event.titulo}
                    </h3>
                    {event.categoria?.nombre && (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {event.categoria.nombre}
                      </span>
                    )}

                    {/* Localidades */}
                    <div className="mt-4 space-y-3">
                      {localidades.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Sin localidades configuradas</p>
                      ) : (
                        localidades.map((loc) => {
                          const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
                          const total = loc.capacidad || 0;
                          const pct = total > 0 ? Math.round((vendidas / total) * 100) : 0;

                          return (
                            <div key={loc.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="font-bold text-xs text-slate-900">{loc.nombre}</span>
                                <span className="font-bold text-xs text-brand">
                                  {loc.precio === 0 ? 'Gratis' : `$${Number(loc.precio).toLocaleString('es-CO')}`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] mb-1">
                                <span className="text-slate-600">
                                  Vendidas: <strong className="text-slate-900">{vendidas}</strong> / {total}
                                </span>
                                <span className="font-bold text-brand">{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    pct >= 90 ? 'bg-emerald-500' : 'bg-brand'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {eventVendidas} boletas vendidas
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {formatCurrency(
                        localidades.reduce((sum, loc) => {
                          const v = (loc.capacidad || 0) - (loc.disponibles || 0);
                          return sum + v * (loc.precio || 0);
                        }, 0)
                      )}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginación — item 6 */}
          {totalElements > pageSize && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={totalElements}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
