import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from './FavoriteButton.jsx';
import { formatPrice } from '../utils/formatters.js';

export default function EventCard({ event }) {
  const { id, category, title, date, location, price, favorite, photo } = event;

  return (
    <article className="group bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={photo}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Categoría Badge con Glassmorphism */}
          <span className="absolute left-3.5 top-3.5 text-[11px] font-bold bg-white/90 backdrop-blur-md text-ink px-2.5 py-1 rounded-lg shadow-sm z-10">
            {category}
          </span>

          <div className="absolute right-3.5 top-3.5 z-10">
            <FavoriteButton initialActive={favorite} />
          </div>

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
            <span className="text-xs font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
              {price === 0 ? 'Entrada Libre' : `Desde ${formatPrice(price)}`}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand mb-1.5">
            {category}
          </p>
          <h3 className="font-display text-[16px] font-bold leading-snug mb-3 text-slate-900 line-clamp-2 group-hover:text-brand transition-colors">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-brand shrink-0" size={14} />
              <span className="font-medium text-slate-700">{date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <FiMapPin className="text-rose-500 shrink-0" size={14} />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <span className="text-[10px] text-muted uppercase font-semibold block leading-none">Precio</span>
          <span className={`font-display font-bold text-base ${price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
            {formatPrice(price)}
          </span>
        </div>

        <Link
          to={`/eventos/${id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          <span>Ver evento</span>
          <FiArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
