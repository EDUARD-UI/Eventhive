import React from 'react';
import {
  FiEye,
  FiCheck,
  FiEdit3,
  FiX,
  FiArrowRight,
  FiLoader,
  FiInbox,
} from 'react-icons/fi';
import { formatFecha, formatHora24 } from '../../utils/formatters.js';

export default function ModeradorResumenView({
  stats = {},
  statsLoading = false,
  pendientes = [],
  pendientesLoading = false,
  totalPendientes = 0,
  actionLoading = false,
  onNavigateTab = () => {},
  onInspect = () => {},
  onAprobar = () => {},
  onSolicitarCorreccion = () => {},
  onRechazar = () => {},
}) {
  // 4 indicadores oficiales de moderación provenientes de la API
  const publicados = stats.publicados ?? stats.aprobados ?? 0;
  const pendientesRevision = stats.pendientesRevision ?? stats.pendientes ?? totalPendientes ?? 0;
  const enCorreccion = stats.enCorreccion ?? stats.correccionesSolicitadas ?? 0;
  const rechazados = stats.rechazados ?? 0;
  const totalHistorico =
    stats.total ??
    stats.totalHistorico ??
    (publicados + pendientesRevision + enCorreccion + rechazados);

  return (
    <div className="space-y-8 select-none animate-in fade-in duration-200">
      {/* =========================================================================
          A. Cabecera Editorial + Barra de Métricas de Cartelera en Línea
         ========================================================================= */}
      <div className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-black text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
              MODERACIÓN Y CONTROL DE CARTELERA
            </h1>
            <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
              Supervisión editorial, validación de requisitos y seguimiento de eventos en Cartagena.
            </p>
          </div>
        </div>

        {/* Barra de Métricas Unificada (Grid 2 columnas en móvil con 5to span 2, 5 columnas en escritorio) */}
        <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] shadow-2xs overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-[#E2E8F0]">
            {/* 1. En Cola de Revisión */}
            <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 border-b md:border-b-0 border-[#E2E8F0]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                En Cola de Revisión
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5B800] shrink-0" />
                <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
                  {statsLoading ? '—' : String(pendientesRevision).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-[#F5B800] uppercase font-bold">
                  PENDIENTES
                </span>
              </div>
            </div>

            {/* 2. Publicados en Cartelera */}
            <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 border-b md:border-b-0 border-[#E2E8F0]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Publicados en Cartelera
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
                  {statsLoading ? '—' : String(publicados).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-[#64748B] uppercase">
                  ACTIVOS
                </span>
              </div>
            </div>

            {/* 3. En Corrección */}
            <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 border-b md:border-b-0 border-[#E2E8F0]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                En Corrección
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg sm:text-xl text-[#B45309]">
                  {statsLoading ? '—' : String(enCorreccion).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-[#B45309] uppercase">
                  AJUSTES
                </span>
              </div>
            </div>

            {/* 4. Rechazados */}
            <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 border-b md:border-b-0 border-[#E2E8F0]">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Rechazados
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg sm:text-xl text-[#DC2626]">
                  {statsLoading ? '—' : String(rechazados).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-[#DC2626] uppercase">
                  NO CONFORME
                </span>
              </div>
            </div>

            {/* 5. Total Histórico (col-span-2 en móvil para ocupar el ancho completo) */}
            <div className="p-4 sm:p-5 flex flex-col justify-center space-y-1 col-span-2 md:col-span-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Total Histórico
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg sm:text-xl text-[#0F2342]">
                  {statsLoading ? '—' : String(totalHistorico).padStart(2, '0')}
                </span>
                <span className="font-mono text-[10px] text-[#64748B] uppercase">
                  REGISTROS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          B. Cola Prioritaria de Eventos (Fichas de Dictamen Limpias)
         ========================================================================= */}
      <div className="space-y-4">
        {/* Cabecera de Sección */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
            <h2 className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider">
              COLA PRIORITARIA DE REVISIÓN
            </h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('eventos')}
            className="font-mono text-xs uppercase tracking-wider text-[#0F2342] hover:text-[#C68B17] font-bold flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>Ver bandeja completa ({totalPendientes})</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>

        {/* Listado de Fichas de Dictamen */}
        {pendientesLoading ? (
          <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] divide-y divide-[#E2E8F0]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-5 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-[2px]" />
                  <div className="space-y-2">
                    <div className="w-48 h-3 bg-slate-100 rounded-[1px]" />
                    <div className="w-64 h-4 bg-slate-100 rounded-[1px]" />
                  </div>
                </div>
                <div className="w-40 h-8 bg-slate-100 rounded-[2px]" />
              </div>
            ))}
          </div>
        ) : pendientes.length === 0 ? (
          <div className="w-full bg-[#FFFFFF] border border-dashed border-[#CBD5E1] rounded-[2px] p-12 text-center space-y-2">
            <FiInbox className="mx-auto text-[#64748B] mb-2" size={28} />
            <h3 className="font-display font-black text-lg text-[#0F2342] uppercase tracking-tight">
              Bandeja al día
            </h3>
            <p className="font-mono text-xs text-[#64748B] max-w-sm mx-auto">
              No hay eventos pendientes de revisión en este momento.
            </p>
          </div>
        ) : (
          <div className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-[2px] divide-y divide-[#E2E8F0] overflow-hidden">
            {pendientes.slice(0, 5).map((evento) => {
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
                  {/* Contenido en bloque: Fila Superior + Fila Media en móvil */}
                  <div className="flex flex-col gap-2.5 min-w-0 flex-1">
                    {/* Fila Superior en móvil (< 768px): Póster 56x56 + Título y Organización */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-[2px] border border-[#E2E8F0] overflow-hidden shrink-0 bg-[#F8F9FA] flex items-center justify-center">
                        {evento.foto ? (
                          <img
                            src={evento.foto}
                            alt={evento.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-[10px] md:text-[11px] font-bold text-[#64748B]">
                            ARTE
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-sans font-bold text-sm sm:text-base text-[#0F2342] truncate leading-tight">
                          {evento.titulo}
                        </h3>
                        <p className="font-sans text-xs text-[#64748B] truncate mt-0.5">
                          Organizado por <strong className="text-[#0F2342] font-semibold">{organizacionNombre}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Fila Media: Fecha, hora y recinto en tipografía monoespaciada */}
                    <div className="font-mono text-[11px] text-[#64748B] uppercase tracking-wide truncate">
                      {metaLine}
                    </div>
                  </div>

                  {/* Fila Inferior en móvil: Grid de 2x2 con gap de 8px (en desktop vuelve a fila flex horizontal) */}
                  <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-[#F1F5F9] md:border-t-0">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onInspect(evento)}
                      className="px-3.5 py-2.5 md:py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50 text-center justify-center flex items-center"
                    >
                      Revisar
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onSolicitarCorreccion(evento)}
                      className="px-3.5 py-2.5 md:py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-amber-50 text-[#B45309] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50 text-center justify-center flex items-center"
                    >
                      Corrección
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onRechazar(evento)}
                      className="px-3.5 py-2.5 md:py-2 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-rose-50 text-[#DC2626] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer disabled:opacity-50 text-center justify-center flex items-center"
                    >
                      Rechazar
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onAprobar(evento.id)}
                      className="px-4 py-2.5 md:py-2 rounded-[2px] bg-[#0F2342] hover:bg-[#15803D] text-[#FFFFFF] font-mono text-xs uppercase tracking-wider font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
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
      </div>
    </div>
  );
}
