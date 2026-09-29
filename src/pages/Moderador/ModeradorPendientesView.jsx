import React, { useState, useMemo } from 'react';
import {
  FiCheckCircle,
  FiSearch,
  FiEye,
  FiCheck,
  FiEdit3,
  FiX,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiFilter,
  FiInbox,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

export default function ModeradorPendientesView({
  pendientes = [],
  pagedData = {},
  loading = false,
  page = 0,
  size = 10,
  onPageChange,
  onPageSizeChange,
  onInspect,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
}) {
  const [localSearch, setLocalSearch] = useState('');

  // Filtrado local sobre los elementos cargados si se escribe en el buscador
  const filtrados = useMemo(() => {
    if (!localSearch.trim()) return pendientes;
    const term = localSearch.toLowerCase();
    return pendientes.filter((e) => {
      const titulo = (e.titulo || '').toLowerCase();
      const org = typeof e.organizacion === 'object'
        ? (e.organizacion?.nombre || '').toLowerCase()
        : String(e.organizacion || '').toLowerCase();
      const cat = typeof e.categoria === 'object'
        ? (e.categoria?.nombre || '').toLowerCase()
        : String(e.categoria || '').toLowerCase();
      const lugar = (e.lugar || '').toLowerCase();
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Barra de control y búsqueda */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900">
              Bandeja de Eventos Pendientes
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {totalElements} en cola
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Eventos esperando revisión y validación de políticas comunitarias
          </p>
        </div>

        {/* Input de búsqueda */}
        <div className="relative w-full sm:w-72">
          <FiSearch
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            size={15}
          />
          <input
            type="text"
            placeholder="Buscar por título, lugar u organización..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
          />
        </div>
      </div>

      {/* Lista de Eventos Pendientes */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-3xl bg-white border border-slate-200/60 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FiInbox size={26} />
          </div>
          <h4 className="font-display text-sm font-bold text-slate-800">
            {localSearch
              ? 'No hay eventos que coincidan con la búsqueda'
              : '¡No hay eventos pendientes de revisión!'}
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {localSearch
              ? 'Verifica los términos ingresados o limpia el buscador.'
              : 'La cola de moderación está completamente al día.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map((evento) => {
            const categoriaNombre =
              typeof evento.categoria === 'object'
                ? evento.categoria?.nombre
                : evento.categoria || 'Evento';

            const organizacionNombre =
              typeof evento.organizacion === 'object'
                ? evento.organizacion?.nombre
                : evento.organizacion || 'Organización';

            return (
              <div
                key={evento.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Foto y Datos del Evento */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                    <div className="w-full sm:w-44 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/70 relative">
                      {evento.foto ? (
                        <img
                          src={evento.foto}
                          alt={evento.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider">
                          Sin foto
                        </div>
                      )}
                      <span className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-brand font-bold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
                        {categoriaNombre}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          #{evento.id}
                        </span>
                        <Badge tone="amber">
                          {evento.estado || 'PENDIENTE_REVISION'}
                        </Badge>
                      </div>

                      <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                        {evento.titulo}
                      </h3>

                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Organizado por: <strong className="text-slate-800">{organizacionNombre}</strong>
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        {evento.fecha && (
                          <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-brand shrink-0" size={13} />
                            <span>
                              {evento.fecha} {evento.hora ? `· ${evento.hora}` : ''}
                            </span>
                          </div>
                        )}
                        {evento.lugar && (
                          <div className="flex items-center gap-1.5 truncate max-w-sm">
                            <FiMapPin className="text-brand shrink-0" size={13} />
                            <span className="truncate">{evento.lugar}</span>
                          </div>
                        )}
                      </div>

                      {evento.descripcion && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {evento.descripcion}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botonera de Moderación */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0 self-stretch lg:self-center justify-end">
                    <button
                      type="button"
                      onClick={() => onInspect(evento)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <FiEye size={14} />
                      <span>Revisar Detalle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSolicitarCorreccion(evento)}
                      className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <FiEdit3 size={14} />
                      <span>Corrección</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRechazar(evento)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <FiX size={14} />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAprobar(evento.id)}
                      className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <FiCheck size={14} />
                      <span>Aprobar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación Real del Servidor */}
      {totalElements > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
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
