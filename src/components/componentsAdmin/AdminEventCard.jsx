import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Eye, Ban, CheckCircle2, Ticket, History } from 'lucide-react';
import Badge from '../Shared/Badge.jsx';

export default function AdminEventCard({
  evento,
  onSelectEvento,
  onToggleEstado,
  onViewHistory,
}) {
  const [imgError, setImgError] = useState(false);
  const fallbackImg =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';

  const isPublicado = evento.estado === 'Publicado';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group hover:-translate-y-0.5">
      {/* Contenedor de Imagen de Portada */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imgError || !evento.foto ? fallbackImg : evento.foto}
          alt={evento.titulo}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Categoría Badge */}
        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[#087fea] text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
          {evento.categoria}
        </span>

        {/* Estado Badge */}
        <span className="absolute top-3 right-3">
          <Badge tone={evento.tono}>{evento.estado}</Badge>
        </span>

        {/* Precio en Portada */}
        <div className="absolute bottom-3 left-3 text-white">
          <p className="text-[11px] text-white/80 font-medium">Entrada desde</p>
          <p className="font-bold text-sm font-display text-white">
            {evento.precio === 0
              ? 'Gratis'
              : new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(evento.precio)}
          </p>
        </div>

        {/* PULEP Badge si existe */}
        {evento.pulep && (
          <div className="absolute bottom-3 right-3 text-white/90 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono">
            {evento.pulep}
          </div>
        )}
      </div>

      {/* Contenido de la Tarjeta */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-[#087fea] transition-colors line-clamp-1">
            {evento.titulo}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
            {evento.organizador}
          </p>

          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <div className="p-1 rounded-md bg-blue-50 text-[#087fea] shrink-0">
                <Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span>
                {evento.fecha} · {evento.hora}
              </span>
            </div>

            <div className="flex items-center gap-2 truncate">
              <div className="p-1 rounded-md bg-amber-50 text-amber-600 shrink-0">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span className="truncate">{evento.lugar}</span>
            </div>

            {evento.aforoTotal && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <div className="p-1 rounded-md bg-purple-50 text-purple-600 shrink-0">
                  <Ticket className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
                <span>
                  Boletas: <strong className="text-slate-800">{evento.vendidas || 0}</strong> /{' '}
                  {evento.aforoTotal}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Acciones del Administrador */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => onSelectEvento(evento)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-[#087fea] hover:text-white text-slate-700 text-xs font-bold transition-all duration-200"
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Detalle</span>
          </button>

          {onViewHistory && (
            <button
              type="button"
              onClick={() => onViewHistory(evento)}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Historial de moderación"
            >
              <History className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onToggleEstado(evento.id)}
            className={`flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-xs font-bold border transition-all duration-200 ${
              isPublicado
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
          >
            {isPublicado ? (
              <>
                <Ban className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Suspender</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Reactivar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
