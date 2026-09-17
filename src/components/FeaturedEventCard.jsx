import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '../utils/formatters.js';

export default function FeaturedEventCard({ event }) {
  const { id, category, title, date, location, price, photo } = event;

  return (
    <article className="group flex flex-col sm:flex-row flex-1 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative w-full sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden bg-slate-100">
        <img
          src={photo}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 sm:opacity-40" />

        <span className="absolute left-3 top-3 text-[11px] font-bold bg-[#ffc107] text-amber-950 px-2.5 py-1 rounded-lg shadow-sm z-10 flex items-center gap-1">
          <span>★</span> Destacado
        </span>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
            {category}
          </span>
          <h3 className="font-display text-lg sm:text-xl font-bold mt-1 mb-3 text-slate-900 leading-snug group-hover:text-brand transition-colors">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-brand shrink-0" size={15} />
              <span className="font-medium text-slate-700">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-rose-500 shrink-0" size={15} />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-muted block">Entrada</span>
            <span className="font-display font-bold text-base sm:text-lg text-slate-900">
              {price === 0 ? 'Gratis' : `Desde ${formatPrice(price)}`}
            </span>
          </div>

          <Link
            to={`/eventos/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-brand-dark shadow-md hover:shadow-lg shadow-brand/20 active:scale-[0.98] transition-all"
          >
            <span>Ver detalles</span>
            <FiArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
