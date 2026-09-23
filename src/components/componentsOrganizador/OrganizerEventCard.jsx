import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiEdit3, FiUsers, FiTag } from 'react-icons/fi';
import Badge from '../Shared/Badge.jsx';

export default function OrganizerEventCard({ event, onEdit, onManage }) {
  const {
    id,
    title,
    category,
    date,
    time = '7:00 PM',
    location,
    price = 0,
    status = 'Activo',
    tone = 'active',
    sold = 0,
    capacity = 100,
    photo,
  } = event;

  const soldNum = typeof sold === 'number' ? sold : Number(String(sold).replace(/[^\d]/g, '')) || 0;
  const capacityNum = typeof capacity === 'number' ? capacity : Number(String(capacity).replace(/[^\d]/g, '')) || 0;
  const percentage = capacityNum > 0 ? Math.min(100, Math.round((soldNum / capacityNum) * 100)) : 0;

  // Fallback image por categoría si no viene photo
  const defaultPhoto = photo || (
    category === 'Deportivo'
      ? 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80'
      : category === 'Gastronomico' || category === 'Gastronomía'
      ? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
      : category === 'Académico'
      ? 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80'
  );

  const formatPriceDisplay = () => {
    if (price === 0 || price === '0' || price === 'Gratis') return 'Entrada Libre';
    if (typeof price === 'string' && price.startsWith('$')) return price;
    return `$${Number(price).toLocaleString('es-CO')}`;
  };

  return (
    <article className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Cabecera con imagen y badges flotantes */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={defaultPhoto}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

          {/* Categoría Badge flotante */}
          <span className="absolute left-3 top-3 text-[11px] font-bold bg-white/95 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-lg shadow-sm z-10">
            {category}
          </span>

          {/* Badge de Estado flotante */}
          <div className="absolute right-3 top-3 z-10">
            <Badge tone={tone}>{status}</Badge>
          </div>

          {/* Precio en la parte inferior de la imagen */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10">
            <span className="text-xs font-semibold bg-slate-900/60 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/10">
              {formatPriceDisplay()}
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
            {category}
          </p>
          <h3 className="font-display text-base font-bold leading-snug text-slate-900 group-hover:text-brand transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600 mb-4">
            <div className="flex items-center gap-2 text-slate-700">
              <FiCalendar className="text-brand shrink-0" size={13} />
              <span className="font-medium">{date}</span>
              <span className="text-slate-300">•</span>
              <FiClock className="text-slate-400 shrink-0" size={13} />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 truncate">
              <FiMapPin className="text-rose-500 shrink-0" size={13} />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Barra de progreso de aforo / ventas */}
          {capacityNum > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <FiUsers size={12} className="text-slate-400" /> Aforo vendido
                </span>
                <span className="font-bold text-slate-800">
                  {soldNum} / {capacityNum}{' '}
                  <span className="text-brand font-semibold text-[11px]">({percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : percentage >= 50
                      ? 'bg-gradient-to-r from-brand to-sky-400'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pie de acciones rápidas */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-[11px] font-semibold text-slate-500">
          ID: #{id}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit && onEdit(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-brand hover:text-brand shadow-xs transition-colors"
          >
            <FiEdit3 size={12} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onManage && onManage(event)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark shadow-xs transition-all"
          >
            <span>Gestionar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
