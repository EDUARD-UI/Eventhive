import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiEdit3, FiUsers } from 'react-icons/fi';
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
    <article className="group bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl overflow-hidden shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_30px_-5px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
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
          <span className="absolute left-3 top-3 text-[10.5px] font-black uppercase tracking-wider bg-[#0B172C] text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-lg shadow-xs z-10 flex items-center gap-1">
            <span>⬡</span>
            <span>{category}</span>
          </span>

          {/* Badge de Estado flotante */}
          <div className="absolute right-3 top-3 z-10">
            <Badge tone={tone}>{status}</Badge>
          </div>

          {/* Precio en la parte inferior de la imagen */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
              {formatPriceDisplay()}
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 sm:p-5">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-950 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md mb-2">
            {category}
          </span>
          <h3 className="font-display text-[15px] sm:text-[16px] font-black leading-snug text-[#0B172C] group-hover:text-amber-700 transition-colors line-clamp-1 mb-2">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600 mb-4 font-medium">
            <div className="flex items-center gap-2 text-slate-700">
              <FiCalendar className="text-amber-600 shrink-0" size={13} />
              <span className="font-semibold">{date}</span>
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
            <div className="bg-[#FAF8F5] border border-amber-200/70 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-semibold flex items-center gap-1">
                  <FiUsers size={12} className="text-amber-600" /> Aforo vendido
                </span>
                <span className="font-black text-slate-900">
                  {soldNum} / {capacityNum}{' '}
                  <span className="text-amber-700 font-black text-[11px]">({percentage}%)</span>
                </span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentage >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : percentage >= 50
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-amber-300 to-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pie de acciones rápidas */}
      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-amber-100 flex items-center justify-between bg-[#FAF8F5]/50">
        <span className="text-[11px] font-bold text-slate-500 font-mono">
          #{id}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit && onEdit(event)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-white text-xs font-bold text-slate-700 hover:border-amber-400 hover:text-amber-800 shadow-2xs transition-colors cursor-pointer"
          >
            <FiEdit3 size={12} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => onManage && onManage(event)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <span>Gestionar</span>
          </button>
        </div>
      </div>
    </article>
  );
}
