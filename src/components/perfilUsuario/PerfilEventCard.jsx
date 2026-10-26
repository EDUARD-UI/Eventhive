import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiHeart } from 'react-icons/fi';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function PerfilEventCard({
  event,
  showFavoriteButton = false,
  onRemoveFavorite,
}) {
  const { t } = useLanguage();

  if (!event) return null;

  const {
    id,
    title,
    shortDate,
    date,
    photo,
    category,
  } = event;

  const displayDate = shortDate || date || t('eventCard.dateTbd');

  return (
    <article className="group relative bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
      {/* Portada del Evento */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
        <Link to={`/eventos/${id}`} className="block w-full h-full">
          <ImageWithFallback
            src={photo}
            alt={title}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            fallbackText={category || 'Evento'}
            iconSize={26}
          />
        </Link>

        {/* Botón de favoritos con corazón rojo en la esquina superior derecha */}
        {showFavoriteButton && (
          <button
            type="button"
            onClick={(e) => onRemoveFavorite && onRemoveFavorite(e, id)}
            title={t('Quitar de favoritos')}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 dark:bg-slate-900/90 text-rose-500 hover:scale-110 active:scale-95 flex items-center justify-center shadow-md z-20 transition-all cursor-pointer border border-slate-100 dark:border-slate-800"
          >
            <FiHeart size={15} className="fill-rose-500 text-rose-500" />
          </button>
        )}
      </div>

      {/* Contenido / Información */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Categoría */}
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
            {t(category || 'GENERAL')}
          </span>

          {/* Título */}
          <Link to={`/eventos/${id}`}>
            <h3
              className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              title={title}
            >
              {title}
            </h3>
          </Link>
        </div>

        {/* Fecha */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <FiCalendar size={13} className="shrink-0" />
          <span>{displayDate}</span>
        </div>
      </div>
    </article>
  );
}
