import React, { useState, useMemo } from 'react';
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiEdit3,
  FiX,
  FiInbox,
  FiLoader,
} from 'react-icons/fi';
import Pagination from '../../components/Shared/Pagination.jsx';
import { formatFecha, formatHora24 } from '../../utils/formatters.js';

export default function ModeradorPendientesView({
  pendientes = [],
  pagedData = {},
  loading = false,
  actionLoading = false,
  page = 0,
  size = 10,
  onPageChange = () => {},
  onPageSizeChange = () => {},
  onInspect = () => {},
  onAprobar = () => {},
  onSolicitarCorreccion = () => {},
  onRechazar = () => {},
}) {
  const [localSearch, setLocalSearch] = useState('');

  // Filtrado local sobre los elementos cargados
  const filtrados = useMemo(() => {
    if (!localSearch.trim()) return pendientes;
    const term = localSearch.toLowerCase();
    return pendientes.filter((e) => {
      const titulo = (e.titulo || '').toLowerCase();
      const org =
        typeof e.organizacion === 'object'
          ? (e.organizacion?.nombre || e.organizacion?.razonSocial || '').toLowerCase()
          : String(e.organizacion || '').toLowerCase();
      const cat =
        typeof e.categoria === 'object'
          ? (e.categoria?.nombre || '').toLowerCase()
          : String(e.categoria || '').toLowerCase();
      const lugar = (e.lugar || e.ubicacion || '').toLowerCase();
      return (
        titulo.includes(term) ||
        org.includes(term) ||
        cat.includes(term) ||
        lugar.includes(term)
      );
    });
  }, [pendientes, localSearch]);

  const totalElements = pagedData?.totalElements ?? pendientes.length;

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      {/* Cabecera Editorial y Buscador Rectangular */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#64748B] block mb-1">
            Bandeja de Dictamen · Curaduría
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F2342] tracking-tight uppercase leading-none">
              BANDEJA DE EVENTOS PENDIENTES
            </h1>
            <span className="font-mono text-xs text-[#0F2342] font-bold px-2 py-0.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-[2px]">
              {totalElements} SOLICITUDES EN COLA
            </span>
          </div>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Eventos esperando revisión técnica y validación de requisitos de publicación.
          </p>
        </div>

        {/* Buscador rectangular (border-radius: 2px) */}
        <div className="relative w-full sm:w-80">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
            size={14}
          />
          <input
            type="text"
            placeholder="Buscar por título, lugar u organización..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] placeholder-[#94A3B8] outline-none focus:border-[#0F2342] transition-colors"
          />
        </div>
      </div>

      {/* Listado de Fichas de Dictamen Limpias */}
      {loading ? (
        <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] divide-y divide-[#E2E8F0]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-[2px]" />
                <div className="space-y-2">
                  <div className="w-48 h-3 bg-slate-100 rounded-[1px]" />
                  <div className="w-72 h-4 bg-slate-100 rounded-[1px]" />
                </div>
              </div>
              <div className="w-48 h-8 bg-slate-100 rounded-[2px]" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="w-full bg-[#FFFFFF] border border-dashed border-[#CBD5E1] rounded-[2px] p-12 text-center space-y-2">
          <FiInbox className="mx-auto text-[#64748B] mb-2" size={28} />
          <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
            {localSearch
              ? 'No hay eventos que coincidan con la búsqueda'
              : 'Cola de dictamen al día'}
          </h3>
          <p className="font-mono text-xs text-[#64748B] max-w-sm mx-auto">
            {localSearch
              ? 'Verifica los términos ingresados o limpia el buscador.'
              : 'No hay eventos pendientes de moderación en este momento.'}
          </p>
        </div>
      ) : (
        <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] divide-y divide-[#E2E8F0] overflow-hidden">
          {filtrados.map((evento) => {
            const categoriaNombre =
              typeof evento.categoria === 'object'
                ? evento.categoria?.nombre || 'General'
                : evento.categoria || 'General';

            const organizacionNombre =
              typeof evento.organizacion === 'object'
                ? evento.organizacion?.nombre || evento.organizacion?.razonSocial || 'Organización'
                : evento.organizacion || 'Organización';

            const fechaFormatted = evento.fecha ? formatFecha(evento.fecha) : 'Fecha por confirmar';
            const horaFormatted = evento.hora ? formatHora24(evento.hora) : null;
            const lugarTexto = evento.lugar || evento.ubicacion || 'Recinto por confirmar';

            const metaLine = `${categoriaNombre.toUpperCase()}  •  ${fechaFormatted}${horaFormatted ? ` — ${horaFormatted}` : ''}  •  ${lugarTexto.toUpperCase()}`;

            return (
              <div
                key={evento.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8F9FA]/70 transition-colors"
              >
                {/* Izquierda: Póster limpio a todo color (sin badges superpuestos) */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 rounded-[2px] border border-[#E2E8F0] overflow-hidden shrink-0 bg-[#F8F9FA] flex items-center justify-center">
                    {evento.foto ? (
                      <img
                        src={evento.foto}
                        alt={evento.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-mono text-[11px] font-bold text-[#64748B]">
                        ARTE
                      </span>
                    )}
                  </div>

                  {/* Centro: Metadatos y Título */}
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] text-[#64748B] truncate uppercase">
                      {metaLine}
                    </p>
                    <h3 className="font-sans font-bold text-sm sm:text-base text-[#0F2342] truncate mt-0.5">
                      {evento.titulo}
                    </h3>
                    <p className="font-sans text-xs text-[#64748B] truncate mt-0.5">
                      Organizado por <strong className="text-[#0F2342] font-semibold">{organizacionNombre}</strong>
                    </p>
                  </div>
                </div>

                {/* Derecha: Botones de Dictamen Rectangulares (border-radius: 2px) */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onInspect(evento)}
                    className="px-3.5 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Revisar
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onSolicitarCorreccion(evento)}
                    className="px-3.5 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-amber-50 text-[#B45309] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Corrección
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onRechazar(evento)}
                    className="px-3.5 py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-rose-50 text-[#DC2626] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Rechazar
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => onAprobar(evento.id)}
                    className="px-4 py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#15803D] text-[#FFFFFF] font-mono text-xs uppercase tracking-wider font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {actionLoading ? (
                      <FiLoader size={13} className="animate-spin" />
                    ) : (
                      <FiCheck size={13} />
                    )}
                    <span>Aprobar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación Limpia del Servidor */}
      {totalElements > 0 && (
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] overflow-hidden p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[#64748B]">
            Mostrando {page * size + 1}–{Math.min((page + 1) * size, totalElements)} de {totalElements} registros
          </span>
          <Pagination
            currentPage={page + 1}
            totalItems={totalElements}
            pageSize={size}
            onPageChange={(newPage) => onPageChange(newPage - 1)}
            onPageSizeChange={(newSize) => onPageSizeChange(newSize)}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}
    </div>
  );
}
