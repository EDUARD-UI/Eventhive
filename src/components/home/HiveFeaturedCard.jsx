import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import FavoriteButton from '../FavoriteButton.jsx';
import { getCategoryGradient } from '../../utils/formatters.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * Celda de panal dorada para la fecha
 */
function HoneycombDateBadge({ dateStr }) {
  const parts = (dateStr || '').split(' ');
  const day = parts.find((p) => /^\d{1,2}$/.test(p)) || '';
  const month = parts.find((p) => p.length === 3 && isNaN(p)) || 'HOY';

  return (
    <div className="relative w-12 h-14 flex items-center justify-center filter drop-shadow-md shrink-0">
      {/* Celda hexagonal dorada */}
      <div className="absolute inset-0 clip-hexagon-horiz bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600" />
      <div className="absolute inset-[2px] clip-hexagon-horiz bg-[#0B172C] flex flex-col items-center justify-center text-center p-1">
        <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider leading-none">
          {month}
        </span>
        <span className="font-display text-sm font-black text-white leading-tight">
          {day || '★'}
        </span>
      </div>
    </div>
  );
}

/**
 * HiveFeaturedCard
 * Tarjeta de evento destacado sobre fondo cálido marfil/crema con
 * bordes ámbar-200, sombra suave, tags accesibles WCAG y celda de panal para la fecha.
 */
export default function HiveFeaturedCard({ event }) {
  const { id, category, title, date, location, photo, favorite } = event;

  return (
    <article className="group relative flex flex-col md:flex-row flex-1 bg-white border border-amber-200/90 hover:border-amber-400 rounded-3xl overflow-hidden transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07)] hover:shadow-[0_20px_35px_-5px_rgba(245,158,11,0.18)] hover:-translate-y-1">
      {/* Imagen del evento */}
      <div className="relative w-full md:w-5/12 aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={photo}
          alt={title}
          className="h-full w-full min-h-[220px]"
          imgClassName="group-hover:scale-105 transition-transform duration-700 ease-out"
          fallbackClassName="h-full w-full min-h-[220px]"
          fallbackGradient={getCategoryGradient(category)}
          fallbackText={category || 'Evento Cartagena'}
          iconSize={26}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/30 pointer-events-none" />

          {/* Badge Destacado con celda de panal */}
          <div className="absolute left-3.5 top-3.5 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10.5px] uppercase tracking-wider shadow-md">
            <span>⬡</span>
            <span>Destacado</span>
          </div>

          {/* Botón Favorito */}
          <div className="absolute right-3.5 top-3.5 z-10">
            <FavoriteButton initialActive={favorite} eventId={id} />
          </div>
        </ImageWithFallback>
      </div>

      {/* Detalles del evento */}
      <div className="p-6 md:p-7 flex-1 flex flex-col justify-between relative z-10 bg-white">
        <div>
          <div className="flex items-center justify-between gap-3 mb-2.5">
            {/* Tag con fondo azul de la navbar */}
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#0D1527] border border-[#0D1527] px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
              <span>●</span> {category}
            </span>

            {/* Badge de Fecha en Celda de Panal */}
            <HoneycombDateBadge dateStr={date} />
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-black text-[#0B172C] group-hover:text-amber-700 transition-colors duration-200 line-clamp-2 leading-snug mb-3">
            {title}
          </h3>

          <div className="space-y-2 text-xs sm:text-sm text-slate-600 mb-6">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-amber-600 shrink-0" size={14} />
              <span className="font-semibold text-slate-700">{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-rose-500 shrink-0" size={14} />
              <span className="truncate text-slate-600">{location}</span>
            </div>
          </div>
        </div>

        {/* Footer con botón de acción */}
        <div className="pt-4 border-t border-amber-100 flex items-center justify-end">
          <Link
            to={`/eventos/${id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/25 active:scale-95 transition-all duration-200"
          >
            <span>Ver detalles</span>
            <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
