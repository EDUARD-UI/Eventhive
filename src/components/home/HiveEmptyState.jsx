import { Link } from 'react-router-dom';
import { FiPlusCircle, FiCompass } from 'react-icons/fi';
import { BeeSvg } from './BeeParticles.jsx';

/**
 * HiveEmptyState
 * Estado vacío temático de colmena en construcción con abejas y néctar dorado.
 * Resalta limpiamente sobre el fondo gris neutro.
 */
export default function HiveEmptyState({
  title = 'Las abejas están preparando la agenda para este fin de semana en Cartagena.',
  subtitle = '¡Vuelve pronto o sé el primero en publicar tu experiencia!',
  showAction = true,
  actionType = 'publish', // 'publish' | 'explore'
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-white p-8 sm:p-12 text-center shadow-xl">
      {/* Resplandor ambiental de miel */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-lg mx-auto flex flex-col items-center">
        {/* Ilustración de Panal en Construcción con Abeja Obrera */}
        <div className="relative w-36 h-32 mb-6 flex items-center justify-center">
          <svg viewBox="0 0 160 140" className="w-full h-full drop-shadow-md">
            {/* Hexágono 1 (Listo con miel) */}
            <polygon
              points="80,10 115,30 115,70 80,90 45,70 45,30"
              fill="rgba(245, 158, 11, 0.2)"
              stroke="#F59E0B"
              strokeWidth="2"
            />
            {/* Relleno de miel interior */}
            <polygon
              points="80,25 105,40 105,65 80,78 55,65 55,40"
              fill="url(#emptyHoneyGradLight)"
              className="animate-pulse"
            />

            {/* Hexágono 2 Izq (En construcción) */}
            <polygon
              points="45,70 80,90 80,130 45,150 10,130 10,90"
              fill="rgba(203, 213, 225, 0.4)"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />

            {/* Hexágono 3 Der (En construcción) */}
            <polygon
              points="115,70 150,90 150,130 115,150 80,130 80,90"
              fill="rgba(203, 213, 225, 0.4)"
              stroke="#F59E0B"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />

            {/* Gotas de miel suspendidas */}
            <circle cx="80" cy="98" r="3.5" fill="#F59E0B" className="animate-bounce" />
            <circle cx="80" cy="112" r="2.2" fill="#FCD34D" opacity="0.9" />

            <defs>
              <linearGradient id="emptyHoneyGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>

          {/* Abeja flotando sobre el panal con animación viva */}
          <div className="absolute -top-1 -right-1 transform -rotate-12 animate-bounce">
            <BeeSvg size={38} angle={-15} isLeader={true} />
          </div>
        </div>

        {/* Badge Temático */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          En Actividad
        </span>

        {/* Título y Mensaje */}
        <h3 className="text-xl sm:text-2xl font-black text-[#0B172C] tracking-tight leading-snug mb-2.5">
          {title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium max-w-md">
          {subtitle}
        </p>

        {/* Botón de acción */}
        {showAction && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {actionType === 'publish' ? (
              <Link
                to="/organizacion"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all duration-200"
              >
                <FiPlusCircle size={15} className="text-slate-950" />
                Publicar un Evento
              </Link>
            ) : (
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all duration-200"
              >
                <FiCompass size={15} className="text-slate-950" />
                Explorar Cartelera Completa
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
