import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCalendar } from 'react-icons/fi';
import Pagination from '../../components/Shared/Pagination.jsx';
import { organizerService } from '../../services/organizerService.js';
import { formatPrice, formatFecha } from '../../utils/formatters.js';

const PAGE_SIZE = 8;

function getStatusIndicator(status) {
  const st = String(status || '').toUpperCase();
  if (st === 'PUBLICADO') return { label: 'A LA VENTA', dotColor: '#F5B800' };
  if (st === 'BORRADOR' || st === 'EN_CORRECCION') return { label: 'BORRADOR', dotColor: '#64748B' };
  if (st === 'PENDIENTE_REVISION') return { label: 'EN REVISIÓN', dotColor: '#F5B800' };
  if (st === 'FINALIZADO' || st === 'CANCELADO') return { label: 'ARCHIVADO', dotColor: '#94A3B8' };
  return { label: 'ACTIVO', dotColor: '#F5B800' };
}

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

  const [organizerEvents, setOrganizerEvents] = useState([]);

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
      .getTodosEventosOrganizador()
      .then((events) => {
        if (!isMounted || !events) return;
        setOrganizerEvents(events);
      })
      .catch((err) => {
        console.warn('No se pudieron cargar todos los eventos de la organización:', err);
      });

    Promise.allSettled([pEst, pEvs]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Consolidar el directorio completo de eventos con sus estadísticas disponibles
  const eventosGanancias = useMemo(() => {
    const eventosPorId = new Map();
    organizerEvents.forEach((event) => {
      if (event.id !== undefined && event.id !== null) {
        eventosPorId.set(String(event.id), event);
      }
    });

    estadisticas.eventos.forEach((stat, index) => {
      const id = stat.eventoId ?? stat.id;
      const key = id === undefined || id === null ? `estadistica-${index}` : String(id);
      eventosPorId.set(key, { ...eventosPorId.get(key), ...stat, id: id ?? key });
    });

    return Array.from(eventosPorId.values()).map((ev, idx) => ({
      key: `ev-stat-${ev.id ?? idx}`,
      id: ev.eventoId ?? ev.id,
      titulo: ev.titulo || ev.nombre || ev.nombreEvento || 'Evento Cultural',
      fecha: ev.fecha,
      boletasVendidas: Number(ev.boletasVendidas ?? ev.totalBoletasVendidas ?? 0),
      ingresosGenerados: Number(
        ev.ingresosNetos ?? ev.ingresosGenerados ?? ev.totalIngresos ?? ev.ingresos ?? 0
      ),
      estado: ev.estado || 'PUBLICADO',
    }));
  }, [estadisticas.eventos, organizerEvents]);

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
    <div className="space-y-8 select-none">
      {/* 1. Cabecera Minimalista */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B] block mb-1">
          Mesa de Producción · Cartagena
        </span>
        <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#0F2342] tracking-tight uppercase leading-none">
          Libro Contable & Taquilla
        </h1>
        <p className="mt-2 text-xs font-mono uppercase tracking-wider text-[#64748B]">
          Auditoría de boletas emitidas y recaudo neto por producción sin intermediarios
        </p>
      </div>

      {/* 2. Encabezado Financiero Tipográfico Dividido por Filete de 1px (Sin Cajas de Colores) */}
      <div className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 items-center">
          {/* Cifra 1: Boletas Emitidas */}
          <div className="md:pr-8">
            <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] block mb-2">
              Volumen de Boletería
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-4xl sm:text-5xl text-[#0F2342] tracking-tight tabular-nums">
                {estadisticas.totalBoletasVendidas.toLocaleString('es-CO')}
              </span>
              <span className="font-display font-bold text-lg text-[#64748B] uppercase">
                Boletas Emitidas
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#94A3B8] mt-1">
              Acumulado total de tickets emitidos en producciones oficiales
            </p>
          </div>

          {/* Filete Separador Vertical + Cifra 2: Recaudo Neto */}
          <div className="md:border-l md:border-[#E2E8F0] md:pl-8 border-t md:border-t-0 pt-6 md:pt-0">
            <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] block mb-2">
              Balance Financiero
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-black text-4xl sm:text-5xl text-[#0F2342] tracking-tight tabular-nums">
                {formatPrice(estadisticas.ingresosNetos)}
              </span>
              <span className="font-display font-bold text-lg text-[#64748B] uppercase">
                Recaudo Neto
              </span>
            </div>
            <p className="font-mono text-[11px] text-[#94A3B8] mt-1">
              Ingresos netos transferibles a la cuenta de la organización
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Selector de Estado */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase text-[#64748B]">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-1.5 font-mono text-xs uppercase text-[#0F2342] outline-none cursor-pointer focus:border-[#0F2342]"
          >
            <option value="Todos">Todos</option>
            <option value="PUBLICADO">En Venta</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PENDIENTE_REVISION">En Revisión</option>
            <option value="FINALIZADO">Archivados</option>
          </select>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <FiSearch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR POR NOMBRE..."
            className="w-full rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] pl-8 pr-3 py-1.5 font-mono text-[11px] uppercase text-[#0F2342] placeholder:text-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>
      </div>

      {/* 4. Libro Contable Editorial (Filas con Filetes de 1px, Sin Badges de Colores) */}
      <div className="rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-[#64748B] font-bold">
            Registro Contable por Producción
          </span>
          <span className="font-mono text-[11px] text-[#94A3B8]">
            {filteredEventos.length} Producciones
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs font-mono text-[#64748B]">
            <div className="w-6 h-6 border-2 border-[#0F2342] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            CONSULTANDO LIBRO CONTABLE...
          </div>
        ) : filteredEventos.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[#64748B] bg-[#FAFAFA]">
            NO SE ENCONTRARON REGISTROS QUE COINCIDAN CON LOS CRITERIOS.
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {paginatedEventos.map((ev) => {
              const status = getStatusIndicator(ev.estado);

              return (
                <div
                  key={ev.key}
                  className="p-5 sm:px-6 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8F9FA] transition-colors"
                >
                  {/* Producción e Identidad */}
                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: status.dotColor }}
                        aria-hidden="true"
                      />
                      <h4 className="font-display font-black text-base text-[#0F2342] uppercase tracking-tight truncate">
                        {ev.titulo}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#64748B]">
                      {ev.fecha && (
                        <span>{formatFecha(ev.fecha)}</span>
                      )}
                      <span>•</span>
                      <span className="uppercase tracking-wider">
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Números Tabulares Alineados a la Derecha */}
                  <div className="flex items-center justify-between md:justify-end gap-8 shrink-0">
                    {/* Boletas */}
                    <div className="text-left md:text-right">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] block">
                        Boletas Emitidas
                      </span>
                      <span className="font-mono text-base font-bold text-[#0F2342] tabular-nums">
                        {ev.boletasVendidas.toLocaleString('es-CO')}
                      </span>
                    </div>

                    {/* Recaudo */}
                    <div className="text-right min-w-[140px]">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] block">
                        Recaudo Neto
                      </span>
                      <span className="font-mono text-lg font-black text-[#0F2342] tabular-nums">
                        {formatPrice(ev.ingresosGenerados)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredEventos.length > PAGE_SIZE && (
          <div className="p-4 border-t border-[#E2E8F0] flex justify-center bg-[#FFFFFF]">
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
