import React, { useEffect, useMemo, useState } from 'react';
import {
  FiCreditCard,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiLayers,
  FiCheckCircle,
  FiActivity,
  FiTag,
  FiCalendar,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice, formatFecha } from '../../utils/formatters.js';

const PAGE_SIZE = 8;

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

export default function EntradasView() {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Estadísticas oficiales del endpoint (GET /api/organizaciones/mi-organizacion/estadisticas)
  const [estadisticas, setEstadisticas] = useState({
    totalBoletasVendidas: 0,
    ingresosNetos: 0,
    eventos: [],
  });

  // Lista detallada de eventos con localidades completas
  const [eventsWithLocalidades, setEventsWithLocalidades] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const pEst = organizerService
      .getEstadisticasMiOrganizacion()
      .then((data) => {
        if (!isMounted || !data) return;
        const lista =
          data.eventos?.content ||
          (Array.isArray(data.eventos)
            ? data.eventos
            : data.estadisticasEventos || data.listaEventos || []);
        setEstadisticas({
          totalBoletasVendidas:
            data.totalBoletasVendidasPorEventosPublicados ??
            data.totalBoletas ??
            data.totalBoletasVendidas ??
            0,
          ingresosNetos: data.ingresosNetos ?? data.totalIngresos ?? 0,
          eventos: Array.isArray(lista) ? lista : [],
        });
      })
      .catch((err) => {
        console.warn('No se pudo cargar estadísticas de entradas:', err);
      });

    const pEvs = organizerService
      .getEventosOrganizador({ page: 0, size: 200 })
      .then((events) => {
        if (!isMounted || !events) return;
        setEventsWithLocalidades(events);
      })
      .catch(() => {});

    Promise.allSettled([pEst, pEvs]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Consolidar eventos con estadísticas y localidades
  const eventosGanancias = useMemo(() => {
    const rawList = estadisticas.eventos.length > 0 ? estadisticas.eventos : eventsWithLocalidades;
    const activeEvs = rawList.filter(
      (ev) => (ev.estado || '').toUpperCase() !== 'FINALIZADO'
    );

    return activeEvs.map((ev, idx) => {
      // Cruzar con información de localidades si está disponible
      const matchedEvent = eventsWithLocalidades.find(
        (e) => String(e.id) === String(ev.eventoId || ev.id)
      );

      const localidades = matchedEvent?.localidades || ev.localidades || [];

      // Calcular boletas y recaudos de respaldo si vienen en localidades
      let boletasCalculadas = 0;
      let recaudoCalculado = 0;
      let capacidadTotal = 0;

      if (Array.isArray(localidades) && localidades.length > 0) {
        localidades.forEach((loc) => {
          const cap = Number(loc.capacidad || 0);
          const disp = Number(loc.disponibles !== undefined ? loc.disponibles : cap);
          const vend = Math.max(0, cap - disp);
          boletasCalculadas += vend;
          recaudoCalculado += vend * Number(loc.precio || 0);
          capacidadTotal += cap;
        });
      }

      const boletasFinales = Number(
        ev.boletasVendidas ??
          ev.totalBoletasVendidas ??
          boletasCalculadas
      );

      const ingresosFinales = Number(
        ev.ingresosNetos ??
          ev.ingresosGenerados ??
          ev.totalIngresos ??
          ev.ingresos ??
          recaudoCalculado
      );

      return {
        key: `ev-stat-${ev.id || idx}`,
        id: ev.eventoId || ev.id,
        titulo: ev.titulo || ev.nombre || ev.nombreEvento || 'Evento Cultural',
        fecha: matchedEvent?.fecha || ev.fecha,
        boletasVendidas: boletasFinales,
        ingresosGenerados: ingresosFinales,
        estado: ev.estado || matchedEvent?.estado || 'PUBLICADO',
        localidades,
        capacidadTotal,
        pctOcupacion:
          capacidadTotal > 0 ? Math.round((boletasFinales / capacidadTotal) * 100) : 0,
      };
    });
  }, [estadisticas.eventos, eventsWithLocalidades]);

  // Filtrado de eventos
  const filteredEventos = useMemo(() => {
    return eventosGanancias.filter((ev) => {
      const matchesStatus =
        statusFilter === 'Todos' || ev.estado === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || ev.titulo.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [eventosGanancias, statusFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const paginatedEventos = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEventos.slice(start, start + PAGE_SIZE);
  }, [filteredEventos, currentPage]);

  return (
    <div className="space-y-6">
      {/* 1. Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Ticketing & Recaudo Oficial
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <FiCreditCard className="w-5 h-5 text-amber-500" />
            <span>Gestión de Entradas y Boletaje</span>
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 max-w-xl font-medium">
            Supervisa en tiempo real el aforo, la venta de boletas por localidad y los recaudos netos de tu organización sin comisiones.
          </p>
        </div>
      </div>

      {/* 2. KPIs de Entradas y Ganancias Oficiales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <FiCreditCard size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Total de Boletas Vendidas
              </span>
              <strong className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                {estadisticas.totalBoletasVendidas.toLocaleString('es-CO')}
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Acumulado en producciones publicadas
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-amber-100/70 text-amber-900 shrink-0">
            Boletería
          </span>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
              <FiDollarSign size={24} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                Ingresos Netos Organización
              </span>
              <strong className="text-2xl sm:text-3xl font-black font-display text-slate-900">
                {formatPrice(estadisticas.ingresosNetos)}
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Descontando comisiones de EventHive
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-emerald-100/70 text-emerald-900 shrink-0">
            Recaudo Neto
          </span>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-medium">Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="Todos">Todos</option>
              <option value="PUBLICADO">Publicados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_REVISION">En revisión</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar evento por título..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* 4. Lista Editorial de Eventos con Rendimiento de Boletaje */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display text-base font-black text-slate-900">
              Rendimiento de Entradas y Aforo por Evento
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Detalle consolidado de tickets emitidos y localidades configuradas
            </p>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {filteredEventos.length} eventos registrados
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Cargando estadísticas de entradas...
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No se encontraron registros de ventas que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedEventos.map((ev) => (
              <div
                key={ev.key}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 hover:border-amber-300 bg-white shadow-2xs hover:shadow-xs transition-all space-y-3.5"
              >
                {/* Cabecera del Evento en Ticketing */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-display text-sm sm:text-base font-black text-slate-900 truncate">
                        {ev.titulo}
                      </h4>
                      <Badge tone={toneMap[ev.estado] || 'neutral'}>{ev.estado}</Badge>
                    </div>
                    {ev.fecha && (
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <FiCalendar size={11} className="text-slate-400" />
                        <span>{formatFecha(ev.fecha)}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Boletas
                      </span>
                      <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg inline-block">
                        {ev.boletasVendidas.toLocaleString('es-CO')} boletas
                      </span>
                    </div>

                    <div className="text-right border-l border-slate-100 pl-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Recaudo Neto
                      </span>
                      <span className="text-sm font-black font-display text-emerald-700">
                        {formatPrice(ev.ingresosGenerados)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Localidades configuradas con barras de progreso de aforo */}
                {Array.isArray(ev.localidades) && ev.localidades.length > 0 ? (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Localidades ({ev.localidades.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {ev.localidades.map((loc, idx) => {
                        const cap = Number(loc.capacidad || 0);
                        const disp = Number(loc.disponibles !== undefined ? loc.disponibles : cap);
                        const vend = Math.max(0, cap - disp);
                        const pct = cap > 0 ? Math.round((vend / cap) * 100) : 0;

                        return (
                          <div
                            key={loc.id || idx}
                            className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between gap-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-900 truncate">
                                {loc.nombre || `Zona ${idx + 1}`}
                              </span>
                              <span className="font-display font-black text-amber-700 text-xs">
                                {formatPrice(loc.precio || 0)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>Capacidad: {cap}</span>
                              <span className="font-bold text-slate-700">{pct}% vendido</span>
                            </div>

                            <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  pct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1 text-[11px] text-slate-400 italic">
                    Sin localidades detalladas para este registro.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {filteredEventos.length > PAGE_SIZE && (
          <div className="pt-3 border-t border-slate-100 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredEventos.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              showPageSize={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
