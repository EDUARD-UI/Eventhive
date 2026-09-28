import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from './FavoriteButton.jsx';
import { formatPrice, getCategoryGradient } from '../utils/formatters.js';
import ImageWithFallback from './common/ImageWithFallback.jsx';

export default function FeaturedEventCard({ event }) {
  const { id, category, title, date, location, price, photo, favorite } = event;

  return (
    <article className="group flex flex-col sm:flex-row flex-1 bg-white border border-slate-200/90 rounded-2xl overflow-hidden card-interactive">
      <div className="relative w-full sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={photo}
          alt={title}
          className="h-full w-full min-h-[200px]"
          imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
          fallbackClassName="h-full w-full min-h-[200px]"
          fallbackGradient={getCategoryGradient(category)}
          fallbackText={category || 'Sin imagen'}
          iconSize={26}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 sm:opacity-40 group-hover:opacity-75 transition-opacity duration-300 pointer-events-none" />

          <span className="absolute left-3 top-3 text-[10.5px] font-extrabold bg-[#ffc107] text-amber-950 px-2.5 py-1 rounded-lg shadow-xs z-10 flex items-center gap-1 uppercase tracking-wider">
            <span>★</span> Destacado
          </span>

          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton initialActive={favorite} eventId={id} />
          </div>
        </ImageWithFallback>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand block mb-1">
            {category}
          </span>
          <h3 className="font-display text-lg sm:text-[19px] font-bold mt-0.5 mb-3 text-slate-900 leading-snug group-hover:text-brand transition-colors duration-200 line-clamp-2">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 mb-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-brand shrink-0" size={14} />
              <span className="font-medium text-slate-700">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-rose-500 shrink-0" size={14} />
              <span className="truncate text-slate-600">{location}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Entrada</span>
            <span className="font-display font-extrabold text-base sm:text-lg text-slate-900">
              {price === 0 ? 'Gratis' : `Desde ${formatPrice(price)}`}
            </span>
          </div>

          <Link
            to={`/eventos/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-brand-dark shadow-xs hover:shadow-md hover:shadow-brand/20 active:scale-[0.97] transition-all duration-200"
          >
            <span>Ver detalles</span>
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
