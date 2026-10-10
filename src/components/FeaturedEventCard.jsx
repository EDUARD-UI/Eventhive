import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from './FavoriteButton.jsx';
import { formatPrice, getCategoryGradient } from '../utils/formatters.js';
import ImageWithFallback from './common/ImageWithFallback.jsx';

export default function FeaturedEventCard({ event }) {
  const { id, category, title, date, location, price, photo, favorite } = event;

  return (
    <article className="group flex flex-col sm:flex-row flex-1 bg-[#FBBF24] border-2 border-black rounded-2xl overflow-hidden card-interactive shadow-md hover:shadow-xl">
      <div className="relative w-full sm:w-2/5 aspect-video sm:aspect-auto overflow-hidden bg-slate-900 border-b-2 sm:border-b-0 sm:border-r-2 border-black">
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

          <span className="absolute left-3 top-3 text-[10.5px] font-black bg-black text-[#FBBF24] px-2.5 py-1 rounded-lg shadow-xs border border-black z-10 flex items-center gap-1 uppercase tracking-wider">
            <span>★</span> Destacado
          </span>

          <div className="absolute right-3 top-3 z-10">
            <FavoriteButton initialActive={favorite} eventId={id} />
          </div>
        </ImageWithFallback>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-[#FBBF24]">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-black/80 block mb-1">
            {category}
          </span>
          <h3 className="font-display text-lg sm:text-[19px] font-black mt-0.5 mb-3 text-black leading-snug group-hover:text-slate-900 transition-colors duration-200 line-clamp-2">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs sm:text-sm text-black mb-4 font-bold">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-black shrink-0" size={14} />
              <span className="font-black text-black">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-black shrink-0" size={14} />
              <span className="truncate text-black">{location}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t-2 border-black flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-black/75 block mb-0.5">Entrada</span>
            <span className="font-display font-black text-base sm:text-lg text-black">
              {price === 0 ? 'Gratis' : `Desde ${formatPrice(price)}`}
            </span>
          </div>

          <Link
            to={`/eventos/${id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[#FBBF24] bg-black hover:bg-slate-900 border-2 border-black shadow-xs hover:shadow-md active:scale-[0.97] transition-all duration-200"
          >
            <span>Ver detalles</span>
            <FiArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
