import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiCalendar, FiClock } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';

/**
 * EventListCard
 * Card vertical estilo Boleto/Ticket de Alta Gama:
 * - Diseño pulcro y limpio sin huecos laterales, con líneas de perforación discretas.
 * - Variante dorada elegante y refinada para eventos destacados.
 * - Iconos monocromáticos en blanco y negro en todas las variantes.
 * - Variación de proporción aspectVariant para armonizar con la cartelera Pinterest.
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
    isGolden || aspectVariant === 'tall'
      ? 'aspect-[4/3]'
      : aspectVariant === 'wide'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';

  const cardBorderClass = isGolden
    ? 'border-2 border-[#E5C158] hover:border-[#D4AF37] shadow-[0_8px_28px_rgba(212,175,55,0.18)] hover:shadow-[0_16px_36px_rgba(212,175,55,0.28)] hover:-translate-y-1.5'
    : 'border border-slate-200/90 hover:border-slate-400/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-1';

  const cardBgClass = isGolden
    ? 'bg-gradient-to-b from-[#FFFDF7] via-[#FFF8E7] to-[#FDF0CD]'
    : 'bg-white';

  const dashedLineClass = isGolden ? 'border-[#E5C158]/60' : 'border-slate-200';

  return (
    <article
      className={`group relative h-full rounded-3xl transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden ${cardBgClass} ${cardBorderClass}`}
    >
      {/* Sutil brillo elegante para tarjetas destacadas */}
      {isGolden && (
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/0 via-[#F3E5AB]/20 to-white/40 pointer-events-none" />
      )}

      {/* SECCIÓN SUPERIOR: Portada + Título */}
      <div className="relative z-1">
        {/* Imagen del evento */}
        <div
          className={`relative ${aspectClass} overflow-hidden rounded-2xl m-3.5 mb-2.5 bg-slate-900 border ${
            isGolden ? 'border-[#E5C158]/70 shadow-xs' : 'border-slate-100'
          }`}
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
              className={`absolute top-2.5 left-2.5 ${
                isGolden
                  ? 'bg-slate-950/90 text-amber-300 border border-amber-400/60'
                  : 'bg-slate-950/85 text-amber-400 border border-slate-700/80'
              } backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs`}
            >
              {category}
            </span>
          )}

          {/* Badge Destacado */}
          {isGolden && (
            <span className="absolute top-2.5 right-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-slate-950 font-black text-[9.5px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 border border-[#C5A028]">
              <span>★</span> Destacado
            </span>
          )}
        </div>

        {/* Título del evento */}
        <div className="px-5 pt-1 pb-2">
          <Link
            to={`/eventos/${id}`}
            className={`block transition-colors duration-200 ${
              isGolden
                ? 'text-slate-950 group-hover:text-amber-900 font-black'
                : 'text-slate-950 group-hover:text-amber-600 font-extrabold'
            }`}
          >
            <h3 className="text-base sm:text-[17px] tracking-tight uppercase leading-snug line-clamp-2 min-h-[2.75rem]">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* LÍNEA DE SEPARACIÓN ESTILO TIQUETE (Limpia, sin huequitos) */}
      <div className="w-full px-4 my-1 z-1">
        <div className={`w-full border-b-2 border-dashed ${dashedLineClass}`} />
      </div>

      {/* SECCIÓN INTERMEDIA: Metadatos del Boleto (FECHA, LUGAR con iconos en BLANCO Y NEGRO) */}
      <div className="px-5 py-3 space-y-3 relative z-1">
        {/* FECHA Y HORA */}
        <div>
          <span
            className={`text-[10px] uppercase tracking-wider block ${
              isGolden ? 'font-black text-amber-950/70' : 'font-bold text-slate-400'
            }`}
          >
            FECHA Y HORA
          </span>
          <div
            className={`flex items-center gap-1.5 text-xs mt-0.5 ${
              isGolden ? 'font-black text-slate-950' : 'font-bold text-slate-800'
            }`}
          >
            {/* Icono en blanco y negro */}
            <FiCalendar className="text-slate-950 shrink-0" size={13} />
            <span>{displayDate}</span>
            {displayTime && (
              <>
                <span className={isGolden ? 'text-amber-900/40' : 'text-slate-300'}>•</span>
                {/* Icono en blanco y negro */}
                <FiClock className="text-slate-950 shrink-0" size={12} />
                <span>{displayTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Cápsula de Ubicación (Icono en blanco y negro) */}
        <div
          className={`flex items-center gap-2 p-2 rounded-xl text-xs ${
            isGolden
              ? 'bg-[#FDF4DB] border border-[#E9C96D] text-amber-950 font-bold shadow-xs'
              : 'bg-slate-50 border border-slate-100 text-slate-700'
          }`}
        >
          {/* Icono en blanco y negro */}
          <FiMapPin className="text-slate-950 shrink-0" size={13} />
          <span className="truncate font-semibold">{location || 'Cartagena de Indias'}</span>
        </div>
      </div>

      {/* SEGUNDA LÍNEA DE SEPARACIÓN ESTILO TIQUETE (Limpia, sin huequitos) */}
      <div className="w-full px-4 my-1 z-1">
        <div className={`w-full border-b-2 border-dashed ${dashedLineClass}`} />
      </div>

      {/* SECCIÓN INFERIOR: Botón de Acción */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center relative z-1">
        <Link
          to={`/eventos/${id}`}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer ${
            isGolden
              ? 'bg-slate-950 hover:bg-[#D4AF37] hover:text-slate-950 text-amber-300 border border-[#D4AF37]/40 shadow-sm'
              : 'bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white shadow-xs'
          }`}
        >
          <FiEye size={14} />
          <span>Ver evento</span>
        </Link>
      </div>
    </article>
  );
}
