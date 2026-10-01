import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { Flame } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * TrendingMarqueeCard
 * Tarjeta individual optimizada para el carrusel horizontal sobre fondo cálido marfil.
 */
function TrendingMarqueeCard({ event }) {
  return (
    <Link
      to={`/eventos/${event.id}`}
      className="group relative flex-shrink-0 w-[280px] sm:w-[310px] rounded-2xl bg-white border border-amber-200/80 hover:border-amber-400 p-3.5 transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_30px_-5px_rgba(245,158,11,0.18)] hover:-translate-y-1 block text-left"
    >
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-100">
        <ImageWithFallback
          src={event.photo}
          alt={event.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          fallbackText={event.category}
          iconSize={22}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Badge Tendencia */}
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-sm">
          <Flame size={11} className="text-amber-200" />
          <span>Trending</span>
        </span>

        {/* Precio sobre imagen */}
        <span className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#0B172C] text-amber-300 border border-amber-400/30">
          {event.price === 0 ? 'Gratis' : formatPrice(event.price)}
        </span>
      </div>

      <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-950 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md mb-1.5">
        {event.category}
      </span>
      <h4 className="font-display text-sm font-black text-[#0B172C] group-hover:text-amber-700 transition-colors line-clamp-1 mb-2">
        {event.title}
      </h4>

      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-amber-100">
        <span className="flex items-center gap-1.5 truncate">
          <FiCalendar size={12} className="text-amber-600 shrink-0" />
          <span className="truncate font-semibold text-slate-700">{event.date}</span>
        </span>
        <span className="flex items-center gap-1 text-slate-500 shrink-0">
          <FiMapPin size={11} className="text-rose-500" />
          <span>Cartagena</span>
        </span>
      </div>
    </Link>
  );
}

/**
 * TrendingMarquee
 * Carrusel continuo tipo Infinite Marquee horizontal para los eventos en tendencia de la semana (MÁXIMO 8).
 */
export default function TrendingMarquee({ events = [], bgFadeColor = '#F4ECE1' }) {
  if (!events || events.length === 0) return null;

  // Limitar estrictamente a MÁXIMO 8 eventos en tendencia
  const top8Events = events.slice(0, 8);

  // Duplicar la lista para asegurar un ciclo continuo infinito sin costuras
  const displayList = [...top8Events, ...top8Events];

  return (
    <div className="w-full relative overflow-hidden py-3 select-none">
      {/* Sombras laterales para desvanecimiento elegante del marquee sobre el fondo cálido */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${bgFadeColor}, transparent)`,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${bgFadeColor}, transparent)`,
        }}
      />

      {/* Contenedor animado del Infinite Marquee */}
      <div className="animate-marquee gap-5 flex items-center">
        {displayList.map((event, index) => (
          <TrendingMarqueeCard key={`${event.id}-${index}`} event={event} />
        ))}
      </div>
    </div>
  );
}
