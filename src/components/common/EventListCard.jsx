import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';
import { formatHora23 } from '../../utils/formatters.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * EventListCard
 * Card vertical estilo Boleto/Ticket:
 * - Todas las tarjetas con fondo blanco limpio (modo oscuro: #0B1428).
 * - Los eventos destacados se diferencian únicamente por el badge con estrella dorada.
 * - Sin gradientes ni emojis.
 */
export default function EventListCard({
  event,
  notchBg = 'bg-[#F8FAFC]',
  aspectVariant = 'standard',
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

  const isGolden = Boolean(promocionado);
  const displayDate = shortDate || date || t('eventCard.dateTbd');
  const displayTime = formattedTime ? formatHora23(formattedTime) : (event.hora ? formatHora23(event.hora) : null);

  const aspectClass =
    aspectVariant === 'tall'
      ? 'aspect-[4/3]'
      : aspectVariant === 'wide'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';

  return (
    <article
      className="group relative h-full rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden bg-white dark:bg-[#151D2F] border border-slate-200/90 dark:border-white/[0.07] hover:border-slate-400/80 hover:dark:bg-slate-800 hover:dark:border-white/15 shadow-sm hover:shadow-md hover:-translate-y-1"
    >
      {/* SECCIÓN SUPERIOR: Portada + Título */}
      <div className="relative z-10">
        {/* Imagen del evento */}
        <div
          className={`relative ${aspectClass} overflow-hidden rounded-2xl m-3.5 mb-2.5 bg-slate-900 border border-slate-100 dark:border-white/10 shadow-xs`}
        >
          <Link to={`/eventos/${id}`} className="block w-full h-full relative">
            <ImageWithFallback
              src={photo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              fallbackText={category || t('eventCard.defaultCategory')}
              iconSize={24}
            />

            {/* Máscara linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80 group-hover:opacity-95 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
              }}
            />
          </Link>

          {/* Categoría Badge */}
          {category && (
            <span
              className="absolute top-2.5 left-2.5 bg-slate-950/85 text-amber-400 border border-slate-700/80 backdrop-blur-xs text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs font-semibold"
            >
              {category}
            </span>
          )}

          {/* Badge Destacado en dorado limpio con icono FiStar (sin emojis) */}
          {isGolden && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm flex items-center gap-1 border border-amber-400">
              <FiStar size={11} className="fill-slate-950 text-slate-950" />
              <span>{t('eventCard.featuredBadge')}</span>
            </span>
          )}
        </div>

        {/* Título del evento */}
        <div className="px-5 pt-1 pb-2">
          <Link
            to={`/eventos/${id}`}
            className="block transition-colors duration-200 text-slate-950 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 font-extrabold"
          >
            <h3 className="text-base sm:text-[17px] tracking-tight uppercase leading-snug line-clamp-2 min-h-[2.75rem]">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-1 z-1">
        <div className="w-full border-b-2 border-dashed border-slate-200 dark:border-white/[0.08]" />
      </div>

      {/* SECCIÓN INTERMEDIA: Metadatos del Boleto */}
      <div className="px-5 py-3 space-y-3 relative z-1">
        {/* FECHA Y HORA */}
        <div>
          <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400 dark:text-slate-400">
            {t('eventCard.dateAndTime')}
          </span>
          <div className="flex items-center gap-1.5 text-xs mt-0.5 font-bold text-slate-800 dark:text-slate-200">
            <FiCalendar className="text-amber-600 dark:text-amber-400 shrink-0" size={13} />
            <span>{displayDate}</span>
            {displayTime && (
              <>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <FiClock className="text-amber-600 dark:text-amber-400 shrink-0" size={12} />
                <span>{displayTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Cápsula de Ubicación */}
        <div className="flex items-center gap-2 p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-white/[0.06] text-slate-700 dark:text-slate-300">
          <FiMapPin className="text-amber-600 dark:text-amber-400 shrink-0" size={13} />
          <span className="truncate">{location || t('eventCard.defaultCity')}</span>
        </div>
      </div>

      {/* SEGUNDA LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-1 z-1">
        <div className="w-full border-b-2 border-dashed border-slate-200 dark:border-white/[0.08]" />
      </div>

      {/* SECCIÓN INFERIOR: Botón de Acción */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center relative z-1">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer bg-slate-950 hover:bg-slate-800 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <FiEye size={14} />
          <span>{t('eventCard.viewEvent')}</span>
        </Link>
      </div>
    </article>
  );
}
