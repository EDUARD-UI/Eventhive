import { Link } from 'react-router-dom';
import { FiMapPin, FiEye, FiCalendar, FiClock } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';

/**
 * EventListCard
 * Card vertical estilo Boleto/Ticket de Alta Gama:
 * - Basado fielmente en el diseño de tiquete con muescas circulares laterales y perforaciones dashed.
 * - Cabecera con imagen del evento y badge de categoría.
 * - Bloque de información con TICKET ID, DATE & TIME, Ubicación.
 * - Talón inferior con simulación de código de barras numérico y botón de acción "Ver".
 */
export default function EventListCard({ event, notchBg = 'bg-[#F8FAFC]' }) {
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

  const displayDate = shortDate || date || 'Fecha por confirmar';
  const displayTime = formattedTime || (event.hora ? event.hora.slice(0, 5) : null);

  return (
    <article className="group relative bg-white rounded-3xl border border-slate-200/90 hover:border-slate-400/80 transition-all duration-300 ease-out shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      
      {/* SECCIÓN SUPERIOR: Portada + Título */}
      <div>
        {/* Imagen del evento */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl m-3.5 mb-2.5 bg-slate-100 border border-slate-100">
          <Link to={`/eventos/${id}`} className="block w-full h-full">
            <ImageWithFallback
              src={photo}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
              fallbackText={category || 'Evento'}
              iconSize={24}
            />
          </Link>

          {/* Categoría Badge */}
          {category && (
            <span className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-xs text-amber-400 border border-slate-700/80 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
              {category}
            </span>
          )}

          {promocionado && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-xs">
              Destacado
            </span>
          )}
        </div>

        {/* Título del evento */}
        <div className="px-5 pt-1 pb-2">
          <Link to={`/eventos/${id}`} className="block group-hover:text-amber-600 transition-colors duration-200">
            <h3 className="font-extrabold text-slate-950 text-base sm:text-[17px] tracking-tight uppercase leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>
        </div>
      </div>

      {/* PRIMERA PERFORACIÓN DE BOLETO CON MUESCAS CIRCULARES PERFECTAS */}
      <div className="relative flex items-center w-full my-1">
        {/* Muesca izquierda */}
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
        {/* Línea punteada */}
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        {/* Muesca derecha */}
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
      </div>

      {/* SECCIÓN INTERMEDIA: Metadatos del Boleto (TICKET ID, FECHA, LUGAR) */}
      <div className="px-5 py-3 space-y-3">
        {/* DATE & TIME */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            DATE & TIME
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs mt-0.5">
            <FiCalendar className="text-amber-500 shrink-0" size={13} />
            <span>{displayDate}</span>
            {displayTime && (
              <>
                <span className="text-slate-300">•</span>
                <FiClock className="text-slate-400 shrink-0" size={12} />
                <span>{displayTime}</span>
              </>
            )}
          </div>
        </div>

        {/* Mini cápsula de Ubicación */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
          <FiMapPin className="text-amber-500 shrink-0" size={13} />
          <span className="truncate font-semibold">{location || 'Cartagena de Indias'}</span>
        </div>
      </div>

      {/* SEGUNDA PERFORACIÓN DE BOLETO CON MUESCAS CIRCULARES */}
      <div className="relative flex items-center w-full my-1">
        {/* Muesca izquierda */}
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
        {/* Línea punteada */}
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        {/* Muesca derecha */}
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 shadow-[inset_2px_0_4px_rgba(0,0,0,0.03)] z-10 pointer-events-none`} />
      </div>

      {/* SECCIÓN INFERIOR: Botón de Acción */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center">

        {/* Botón único Ver */}
        <Link
          to={`/eventos/${id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-xs"
        >
          <FiEye size={14} />
          <span>Ver</span>
        </Link>
      </div>
    </article>
  );
}
