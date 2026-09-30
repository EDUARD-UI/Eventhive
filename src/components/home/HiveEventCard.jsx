import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from '../FavoriteButton.jsx';
import { formatPrice, getCategoryGradient } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HiveEventCard({ event }) {
  const { id, category, title, date, location, price, favorite, photo } = event;

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
            <span className="absolute left-3 top-3 text-[10.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#0B172C] text-amber-300 border border-amber-400/40 shadow-xs z-10 flex items-center gap-1">
              <span>⬡</span>
              <span>{category}</span>
            </span>

            {/* Favorito */}
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton initialActive={favorite} eventId={id} />
            </div>

            {/* Precio sobre la imagen */}
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white z-10 pointer-events-none">
              <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
                {price === 0 ? 'Entrada Libre' : `Desde ${formatPrice(price)}`}
              </span>
            </div>
          </ImageWithFallback>
        </div>

        <div className="p-4 sm:p-5">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-950 bg-amber-50 border border-amber-200/90 px-2 py-0.5 rounded-md mb-2">
            {category}
          </span>
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

      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-amber-100 flex items-center justify-between bg-amber-50/30">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block leading-none mb-1">
            Precio
          </span>
          <span
            className={`font-display font-black text-sm sm:text-base ${
              price === 0 ? 'text-emerald-700' : 'text-[#0B172C]'
            }`}
          >
            {formatPrice(price)}
          </span>
        </div>

        <Link
          to={`/eventos/${id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm hover:shadow-amber-500/25 transition-all duration-200 active:scale-[0.97]"
        >
          <span>Ver evento</span>
          <FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
