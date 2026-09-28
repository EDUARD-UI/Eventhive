import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from './FavoriteButton.jsx';
import { formatPrice, getCategoryGradient } from '../utils/formatters.js';
import ImageWithFallback from './common/ImageWithFallback.jsx';

export default function EventCard({ event }) {
  const { id, category, title, date, location, price, favorite, photo } = event;

  return (
    <article className="group bg-white border border-slate-200/90 rounded-2xl overflow-hidden card-interactive flex flex-col justify-between">
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none" />

            {/* Categoría Badge con Glassmorphism */}
            <span className="absolute left-3 top-3 text-[10.5px] font-bold glass-pill text-slate-800 px-2.5 py-1 rounded-lg shadow-xs z-10 uppercase tracking-wider">
              {category}
            </span>

            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton initialActive={favorite} eventId={id} />
            </div>

            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10 pointer-events-none">
              <span className="text-[11px] font-bold glass-pill-dark px-2.5 py-0.5 rounded-md shadow-xs">
                {price === 0 ? 'Entrada Libre' : `Desde ${formatPrice(price)}`}
              </span>
            </div>
          </ImageWithFallback>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand mb-1">
            {category}
          </p>
          <h3 className="font-display text-[15px] sm:text-[16px] font-bold leading-snug mb-3 text-slate-900 line-clamp-2 group-hover:text-brand transition-colors duration-200">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-brand shrink-0" size={13.5} />
              <span className="font-medium text-slate-700 truncate">{date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <FiMapPin className="text-rose-500 shrink-0" size={13.5} />
              <span className="truncate text-slate-600">{location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block leading-none mb-1">Precio</span>
          <span className={`font-display font-extrabold text-sm sm:text-base ${price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {formatPrice(price)}
          </span>
        </div>

        <Link
          to={`/eventos/${id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-xs hover:shadow-md hover:shadow-brand/20 transition-all duration-200 active:scale-[0.97]"
        >
          <span>Ver evento</span>
          <FiArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
