import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiEye } from 'react-icons/fi';
import FavoriteButton from '../FavoriteButton.jsx';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HiveEventCard({ event }) {
  if (!event) return null;

  const { id, category, title, date, location, favorite, photo } = event;

  return (
    <article className="group h-full bg-white dark:bg-[#151D2F] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 hover:dark:bg-slate-800 hover:dark:border-white/15 rounded-2xl overflow-hidden transition-all duration-200 ease-out shadow-sm hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between text-slate-900 dark:text-white">
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-900">
          <ImageWithFallback
            src={photo}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
            fallbackText={category || 'Evento'}
            iconSize={26}
          >
            {/* Máscara de degradado linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-85 group-hover:opacity-95 transition-opacity duration-200"
              style={{
                background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
              }}
            />

            {/* Categoría Badge */}
            <span className="absolute left-3 top-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-950/80 text-amber-700 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700/80 shadow-xs z-10 flex items-center gap-1 backdrop-blur-sm">
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
          <Link to={`/eventos/${id}`} className="block">
            <h3 className="font-extrabold text-[15px] sm:text-[16px] leading-snug mb-2 text-slate-900 dark:text-white line-clamp-2 min-h-[2.75rem] group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors duration-200 uppercase tracking-tight">
              {title}
            </h3>
          </Link>

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

      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-white/[0.07] bg-slate-50/80 dark:bg-[#0A1325]">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-out active:scale-95 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <FiEye size={14} />
          <span>Ver evento</span>
        </Link>
      </div>
    </article>
  );
}
