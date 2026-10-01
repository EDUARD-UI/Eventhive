import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from '../FavoriteButton.jsx';
import { getCategoryGradient } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HiveEventCard({ event }) {
  const { id, category, title, date, location, favorite, photo } = event;

  return (
    <article className="group bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_30px_-5px_rgba(245,158,11,0.15)] hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={photo}
            alt={title}
            className="h-full w-full aspect-[4/3]"
            imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
            fallbackClassName="h-full w-full aspect-[4/3]"
            fallbackGradient={getCategoryGradient(category)}
            fallbackText={category || 'Sin imagen'}
            iconSize={26}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />

            {/* Categoría Badge con alto contraste */}
            <span className="absolute left-3 top-3 text-[10.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#0D1527] text-amber-300 border border-amber-400/40 shadow-xs z-10 flex items-center gap-1">
              <span>⬡</span>
              <span>{category}</span>
            </span>

            {/* Favorito */}
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton initialActive={favorite} eventId={id} />
            </div>
          </ImageWithFallback>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-display text-[15px] sm:text-[16px] font-black leading-snug mb-3 text-[#0B172C] line-clamp-2 group-hover:text-amber-700 transition-colors duration-200">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-amber-600 shrink-0" size={13.5} />
              <span className="font-semibold text-slate-700 truncate">{date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <FiMapPin className="text-rose-500 shrink-0" size={13.5} />
              <span className="truncate text-slate-600">{location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-amber-100/70 bg-amber-50/20">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-amber-500/25 transition-all duration-200 active:scale-[0.98]"
        >
          <span>Ver evento</span>
          <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
