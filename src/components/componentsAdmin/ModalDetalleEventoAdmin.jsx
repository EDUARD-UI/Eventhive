import { createPortal } from 'react-dom';
import React from 'react';
import { X, Calendar, Clock, MapPin, Building2, Ticket, ShieldCheck, Ban, CheckCircle2, History } from 'lucide-react';
import Badge from '../Shared/Badge.jsx';

export default function ModalDetalleEventoAdmin({
  evento,
  onClose,
  onToggleEstado,
  onViewHistory,
}) {
  if (!evento) return null;

  const isPublicado = evento.estado === 'Publicado';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner de Imagen */}
        <div className="relative h-56 w-full bg-slate-950">
          <img src={evento.foto} alt={evento.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="bg-[#087fea] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
              {evento.categoria}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1.5 leading-tight">
              {evento.titulo}
            </h2>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-6">
          {/* Metadatos Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4 border-b border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
                <Calendar className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fecha y Hora</p>
                <p className="font-semibold text-slate-800">
                  {evento.fecha} · {evento.hora}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <MapPin className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Lugar / Recinto</p>
                <p className="font-semibold text-slate-800 truncate">{evento.lugar}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Building2 className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Organización</p>
                <p className="font-semibold text-slate-800">{evento.organizador}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Registro PULEP</p>
                <p className="font-mono font-bold text-slate-800">{evento.pulep || 'Trámite en curso'}</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Descripción General
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {evento.descripcion || 'Sin descripción detallada registrada.'}
            </p>
          </div>

          {/* Localidades y Tarifas */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Localidades y Tarifas Aprobadas
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                Aforo total: {evento.aforoTotal || 0} personas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {evento.localidades?.map((loc, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex justify-between items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                      <Ticket className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{loc.nombre}</p>
                      <p className="text-xs text-slate-500">
                        Aforo: {loc.aforo} | Vendidas: {loc.vendidas || 0}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-[#087fea] font-display">
                    {loc.precio === 0
                      ? 'Gratis'
                      : new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(loc.precio)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerta si está suspendido */}
          {!isPublicado && evento.motivoSuspension && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <strong>Motivo de suspensión administrativa:</strong> {evento.motivoSuspension}
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Estado actual:</span>
              <Badge tone={evento.tono}>{evento.estado}</Badge>
            </div>

            <div className="flex items-center gap-2">
              {onViewHistory && (
                <button
                  type="button"
                  onClick={() => onViewHistory(evento)}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <History className="w-4 h-4" strokeWidth={1.75} />
                  <span>Historial Moderación</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onToggleEstado(evento.id);
                  onClose();
                }}
                className={`py-2 px-4 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 transition-all ${
                  isPublicado
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                {isPublicado ? (
                  <>
                    <Ban className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Suspender Administrativamente</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Reactivar Evento</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
