import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiEye } from 'react-icons/fi';
import FavoriteButton from '../FavoriteButton.jsx';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HiveEventCard({ event }) {
  if (!event) return null;

  const { id, category, title, date, location, favorite, photo } = event;

  return (
    <article className="group bg-[#0D182E] border border-slate-800/90 hover:border-slate-600 rounded-2xl overflow-hidden transition-all duration-200 ease-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between text-white">
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <ImageWithFallback
            src={photo}
            alt={title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300 ease-out"
            fallbackText={category || 'Evento'}
            iconSize={26}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D182E] via-transparent to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-200 pointer-events-none" />

            {/* Categoría Badge */}
            <span className="absolute left-3 top-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-950/80 text-amber-400 border border-slate-700/80 shadow-xs z-10 flex items-center gap-1 backdrop-blur-sm">
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
            <h3 className="font-extrabold text-[15px] sm:text-[16px] leading-snug mb-2 text-white line-clamp-2 group-hover:text-amber-300 transition-colors duration-200 uppercase tracking-tight">
              {title}
            </h3>
          </Link>

          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-amber-400 shrink-0" size={13.5} />
              <span className="font-medium text-slate-300 truncate">{date}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <FiMapPin className="text-slate-400 shrink-0" size={13.5} />
              <span className="truncate text-slate-300">{location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-800/80 bg-[#0A1325]">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-out active:scale-95 shadow-xs border border-slate-700/80"
        >
          <FiEye size={14} />
          <span>Ver evento</span>
        </Link>
      </div>
    </article>
  );
}
