import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatHora12 } from '../../utils/formatters.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * EventListCard
 * Card estilo Boleto/Ticket:
 * - Solo la primera card (featured={true}) es alta (aspect-[4/5]).
 * - Las demás cards quedan exactamente como estaban antes (aspect-[16/10], compactas y sin estirarse).
 * - En todas las cards la información queda abajo de la imagen.
 */
export default function EventListCard({
  event,
  notchBg = 'bg-[#F8FAFC]',
  aspectVariant = 'standard',
  masonry = false,
  featured = false,
}) {
  const { t } = useLanguage();

  if (!event) return null;

  const {
    id,
    title,
    location,
    shortDate,
    formattedTime,
    date,
    photo,
    category,
    promocionado,
  } = event;

  const isGolden = Boolean(promocionado) || featured;
  const displayDate = shortDate || date || t('eventCard.dateTbd');
  const displayTime = formattedTime ? formatHora12(formattedTime) : (event.hora ? formatHora12(event.hora) : null);

  // Solo la primera card (featured) es alta. Las demás quedan exactamente en su proporción estándar como estaban antes.
  const aspectClass = featured
    ? 'aspect-[4/5]'
    : aspectVariant === 'portrait'
    ? 'aspect-[4/5]'
    : aspectVariant === 'tall'
    ? 'aspect-[4/3]'
    : aspectVariant === 'wide'
    ? 'aspect-[16/9]'
    : aspectVariant === 'compact'
    ? 'aspect-[2/1]'
    : 'aspect-[16/10]';

  return (
    <article
      className={`group relative h-auto rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden bg-white dark:bg-[#151D2F] border ${
        featured
          ? 'border-amber-500/40 dark:border-amber-400/40 shadow-md ring-1 ring-amber-500/10'
          : 'border-slate-200/90 dark:border-white/[0.07]'
      } hover:border-slate-400/80 hover:dark:bg-slate-800 hover:dark:border-white/15 shadow-sm hover:shadow-md hover:-translate-y-1`}
    >
      {/* SECCIÓN SUPERIOR: Portada (alta solo si es featured) + Título */}
      <div className="relative z-10">
        {/* Imagen del evento */}
        <div
          className={`relative ${aspectClass} overflow-hidden rounded-2xl m-3.5 mb-2.5 bg-slate-900 border border-slate-100 dark:border-white/10 shadow-xs`}
        >
          <Link to={`/eventos/${id}`} className="block w-full h-full relative">
            <ImageWithFallback
              src={photo}
              alt={title}
              className="w-full h-full"
              imgClassName="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              fallbackText={category || t('eventCard.defaultCategory')}
              iconSize={featured ? 28 : 24}
            />

            {/* Máscara suave para legibilidad */}
            <div
              className="absolute inset-0 pointer-events-none opacity-40 group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0, 0, 0, 0.45) 100%)',
              }}
            />
          </Link>

          {/* Categoría Badge */}
          {category && (
            <span
              className="absolute top-2.5 left-2.5 bg-slate-950/85 text-amber-400 border border-slate-700/80 backdrop-blur-xs text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs font-semibold z-10"
            >
              {category}
            </span>
          )}

          {/* Badge Destacado */}
          {isGolden && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 border border-amber-400 z-10">
              <FiStar size={11} className="fill-slate-950 text-slate-950" />
              <span>{featured ? 'DESTACADO' : t('eventCard.featuredBadge')}</span>
            </span>
          )}
        </div>

        {/* Título del evento */}
        <div className="px-4 sm:px-5 pt-1 pb-1.5">
          <Link
            to={`/eventos/${id}`}
            className="block transition-colors duration-200 text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-extrabold"
          >
            <h3 className="text-sm sm:text-[15px] tracking-tight uppercase leading-snug line-clamp-2 min-h-[2.4rem]">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-0.5 z-1">
        <div className="w-full border-b border-dashed border-slate-200 dark:border-white/[0.08]" />
      </div>

      {/* SECCIÓN INTERMEDIA: Metadatos del Boleto */}
      <div className="px-4 sm:px-5 py-2.5 space-y-2.5 relative z-1">
        {/* FECHA Y HORA */}
        <div>
          <span className="text-[9px] uppercase tracking-wider block font-bold text-slate-400 dark:text-slate-500">
            {t('eventCard.dateAndTime')}
          </span>
          <div className="flex items-center gap-1.5 text-xs mt-0.5 font-bold text-slate-800 dark:text-slate-200">
            <FiCalendar className="text-amber-600 dark:text-amber-400 shrink-0" size={12.5} />
            <span>{displayDate}</span>
            {displayTime && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <FiClock className="text-amber-600 dark:text-amber-400 shrink-0" size={11.5} />
                <span>{displayTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Cápsula de Ubicación */}
        <div className="flex items-center gap-1.5 p-1.5 px-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] text-slate-700 dark:text-slate-300">
          <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0" size={12.5} />
          <span className="truncate text-[11px] sm:text-xs">{location || t('eventCard.defaultCity')}</span>
        </div>
      </div>

      {/* SEGUNDA LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-0.5 z-1">
        <div className="w-full border-b border-dashed border-slate-200 dark:border-white/[0.08]" />
      </div>

      {/* SECCIÓN INFERIOR: Botón de Acción */}
      <div className="px-4 sm:px-5 pt-2 pb-4 flex flex-col items-center relative z-1">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <FiEye size={13} />
          <span>{t('eventCard.viewEvent')}</span>
        </Link>
      </div>
    </article>
  );
}
