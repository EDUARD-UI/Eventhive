import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from './FavoriteButton.jsx';
import { getCategoryGradient } from '../utils/formatters.js';
import ImageWithFallback from './common/ImageWithFallback.jsx';

export default function EventCard({ event }) {
  const { id, category, title, date, location, favorite, photo, promocionado } = event;

  return (
    <article className={`group bg-white dark:bg-[#151D2F] border rounded-2xl overflow-hidden shadow-sm hover:shadow-md card-interactive flex flex-col justify-between transition-all duration-300 ${
      promocionado
        ? 'border-amber-400/60 dark:border-amber-500/50 ring-1 ring-amber-400/20 shadow-amber-500/5'
        : 'border-slate-200 dark:border-white/[0.07] hover:dark:bg-slate-800 hover:dark:border-white/15'
    }`}>
      <div>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-900">
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
            {/* Máscara linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%) para garantizar contraste y legibilidad */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80 group-hover:opacity-95 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
              }}
            />

            {/* Categoría y Badge Promocionado con contraste accesible */}
            <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-lg shadow-xs uppercase tracking-wider backdrop-blur-md bg-white/90 dark:bg-slate-950/85 text-slate-800 dark:text-amber-400 border border-slate-200/80 dark:border-white/10">
                {category}
              </span>
              {promocionado && (
                <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 flex items-center gap-1 border border-amber-300">
                  <span>★</span> Promocionado
                </span>
              )}
            </div>

            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton initialActive={favorite} eventId={id} />
            </div>
          </ImageWithFallback>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="font-display text-[15px] sm:text-[16px] font-bold leading-snug mb-3 text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
            {title}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-amber-600 dark:text-amber-400 shrink-0" size={13.5} />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0" size={13.5} />
              <span className="truncate text-slate-600 dark:text-slate-400">{location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 dark:border-white/[0.07] flex items-center justify-between bg-slate-50/80 dark:bg-[#0E1526]/80">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 dark:text-slate-950 text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <span>Ver evento</span>
          <FiArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
