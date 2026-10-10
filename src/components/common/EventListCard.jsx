import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiCalendar, FiClock, FiStar } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';

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
  const displayDate = shortDate || date || 'Fecha por confirmar';
  const displayTime = formattedTime || (event.hora ? event.hora.slice(0, 5) : null);

  const aspectClass =
    aspectVariant === 'tall'
      ? 'aspect-[4/3]'
      : aspectVariant === 'wide'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';

  return (
    <article
      className="group relative h-full rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden bg-white border border-slate-200/90 hover:border-slate-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:-translate-y-1"
    >
      {/* SECCIÓN SUPERIOR: Portada + Título */}
      <div className="relative z-10">
        {/* Imagen del evento */}
        <div
          className={`relative ${aspectClass} overflow-hidden rounded-2xl m-3.5 mb-2.5 bg-slate-900 border border-slate-100 shadow-xs`}
        >
          <Link to={`/eventos/${id}`} className="block w-full h-full">
            <ImageWithFallback
              src={photo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              fallbackText={category || 'Evento'}
              iconSize={24}
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
              <span>Destacado</span>
            </span>
          )}
        </div>

        {/* Título del evento */}
        <div className="px-5 pt-1 pb-2">
          <Link
            to={`/eventos/${id}`}
            className="block transition-colors duration-200 text-slate-950 hover:text-amber-600 font-extrabold"
          >
            <h3 className="text-base sm:text-[17px] tracking-tight uppercase leading-snug line-clamp-2 min-h-[2.75rem]">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-1 z-1">
        <div className="w-full border-b-2 border-dashed border-slate-200" />
      </div>

      {/* SECCIÓN INTERMEDIA: Metadatos del Boleto */}
      <div className="px-5 py-3 space-y-3 relative z-1">
        {/* FECHA Y HORA */}
        <div>
          <span className="text-[10px] uppercase tracking-wider block font-bold text-slate-400">
            FECHA Y HORA
          </span>
          <div className="flex items-center gap-1.5 text-xs mt-0.5 font-bold text-slate-800">
            <FiCalendar className="text-slate-700 shrink-0" size={13} />
            <span>{displayDate}</span>
            {displayTime && (
              <>
                <span className="text-slate-300">•</span>
                <FiClock className="text-slate-700 shrink-0" size={12} />
                <span>{displayTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Cápsula de Ubicación */}
        <div className="flex items-center gap-2 p-2 rounded-xl text-xs bg-slate-50 border border-slate-100 text-slate-700">
          <FiMapPin className="text-slate-700 shrink-0" size={13} />
          <span className="truncate">{location || 'Cartagena de Indias'}</span>
        </div>
      </div>

      {/* SEGUNDA LÍNEA DE SEPARACIÓN ESTILO TIQUETE */}
      <div className="w-full px-4 my-1 z-1">
        <div className="w-full border-b-2 border-dashed border-slate-200" />
      </div>

      {/* SECCIÓN INFERIOR: Botón de Acción */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center relative z-1">
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer bg-slate-950 hover:bg-slate-800 text-white shadow-xs"
        >
          <FiEye size={14} />
          <span>Ver evento</span>
        </Link>
      </div>
    </article>
  );
}
