import { Link } from 'react-router-dom';
import { FiCalendar, FiPlusCircle, FiCompass } from 'react-icons/fi';

/**
 * HiveEmptyState
 * Estado vacío minimalista y limpio:
 * - Sin ilustraciones de abejas, sin gradientes y sin emojis.
 * - Soporte total para tema claro y oscuro.
 */
export default function HiveEmptyState({
  title = 'No hay eventos disponibles en este momento.',
  subtitle = 'Estamos actualizando la cartelera cultural. Vuelve pronto para conocer las nuevas experiencias.',
  showAction = true,
  actionType = 'explore', // 'publish' | 'explore'
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1428] p-8 sm:p-12 text-center shadow-sm max-w-xl mx-auto my-6">
      <div className="flex flex-col items-center">
        {/* Icono minimalista sin gradiente */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-400/20 flex items-center justify-center mb-4">
          <FiCalendar size={24} />
        </div>

        {/* Título y Mensaje */}
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mb-6 font-medium">
          {subtitle}
        </p>

        {/* Botón de acción con color sólido */}
        {showAction && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actionType === 'publish' ? (
              <Link
                to="/organizacion"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs active:scale-95 transition-all duration-200"
              >
                <FiPlusCircle size={15} />
                <span>Publicar un Evento</span>
              </Link>
            ) : (
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-black text-xs uppercase tracking-wider shadow-xs active:scale-95 transition-all duration-200"
              >
                <FiCompass size={15} />
                <span>Explorar Todos los Eventos</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
