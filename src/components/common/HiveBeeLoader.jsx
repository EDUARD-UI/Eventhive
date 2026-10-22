import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * HiveBeeLoader
 * Pantalla / Loader corporativo de EventHive con abejas volando en línea,
 * rayos radiales de fondo, halo circular dorado, texto "Cargando..." y barra de progreso.
 * Compatible con modo oscuro (#070D1B / #0B132B) y modo claro (#F8FAFC / #FFFFFF).
 */
export default function HiveBeeLoader({
  text = 'Cargando...',
  subtext,
  fullScreen = true,
  className = '',
}) {
  const { isDark } = useTheme();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${
        fullScreen
          ? 'fixed inset-0 z-[9999] h-[100dvh] min-h-screen w-full overflow-y-auto'
          : 'relative w-full min-h-[320px] overflow-hidden rounded-3xl p-4 sm:p-6'
      } flex flex-col items-center justify-center overflow-x-hidden select-none transition-colors duration-300 ${
        isDark ? 'bg-[#070D1B] text-white' : 'bg-[#F8FAFC] text-slate-900'
      } ${className}`}
      style={fullScreen ? {
        minHeight: '100dvh',
        padding: 'max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right)) max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left))',
      } : undefined}
    >
      {/* 1. ESTILOS CSS EN LÍNEA PARA LAS ANIMACIONES DE ABEJAS Y RAYOS */}
      <style>{`
        @keyframes beeWingFlapLeft {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-40deg) scale(0.85); }
        }
        @keyframes beeWingFlapRight {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(40deg) scale(0.85); }
        }
        @keyframes beeFlyAcross {
          0% {
            transform: translateX(calc(var(--bee-flight-distance, 120px) * -1)) translateY(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          30% {
            transform: translateX(calc(var(--bee-flight-distance, 120px) * -0.375)) translateY(-8px);
          }
          55% {
            transform: translateX(calc(var(--bee-flight-distance, 120px) * 0.1875)) translateY(7px);
          }
          75% {
            transform: translateX(calc(var(--bee-flight-distance, 120px) * 0.6875)) translateY(-5px);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(var(--bee-flight-distance, 120px)) translateY(0px);
            opacity: 0;
          }
        }
        @keyframes sunburstRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes loaderGlowPulse {
          0%, 100% { opacity: 0.45; transform: scale(0.98); }
          50% { opacity: 0.85; transform: scale(1.04); }
        }
        @keyframes honeyBarIndeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @container (max-width: 96px) {
          .hive-loader-bee { --bee-flight-distance: 12px; }
        }
        @container (min-width: 97px) and (max-width: 160px) {
          .hive-loader-bee { --bee-flight-distance: 24px; }
        }
        @container (min-width: 161px) and (max-width: 200px) {
          .hive-loader-bee { --bee-flight-distance: 40px; }
        }
        @container (min-width: 201px) and (max-width: 240px) {
          .hive-loader-bee { --bee-flight-distance: 56px; }
        }
        @container (min-width: 241px) and (max-width: 280px) {
          .hive-loader-bee { --bee-flight-distance: 80px; }
        }
        @container (min-width: 281px) and (max-width: 319px) {
          .hive-loader-bee { --bee-flight-distance: 96px; }
        }
        @container (min-width: 320px) {
          .hive-loader-bee { --bee-flight-distance: 120px; }
        }
      `}</style>

      {/* 2. FONDO DE RAYOS RADIALES (SUNBURST) CORPORATIVO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Halo resplandeciente central */}
        <div
          className={`absolute aspect-square w-[min(100%,30rem)] rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
            isDark ? 'bg-amber-500/15' : 'bg-amber-400/20'
          }`}
          style={{ animation: 'loaderGlowPulse 4s ease-in-out infinite' }}
        />

        {/* Rayos rotatorios estilizados */}
        <div
          className={`absolute aspect-square w-[min(100%,56rem)] pointer-events-none transition-opacity duration-500 ${
            isDark ? 'opacity-20' : 'opacity-15'
          }`}
          style={{ animation: 'sunburstRotate 60s linear infinite' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-amber-500">
            {[...Array(18)].map((_, i) => (
              <polygon
                key={i}
                points="50,50 46,0 54,0"
                transform={`rotate(${i * 20} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Gradiente radial de viñeta para suavizar bordes */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle at center, transparent 30%, #070D1B 80%)'
              : 'radial-gradient(circle at center, transparent 35%, #F8FAFC 85%)',
          }}
        />
      </div>

      {/* 3. CENTRO: CÍRCULO CON ISOTIPO + ÓRBITAS + ABEJAS VOLANDO EN LÍNEA */}
      <div className="relative z-10 flex w-full min-w-0 max-w-[20rem] flex-col items-center px-2">
        {/* Contenedor central con la animación */}
        <div
          className="hive-loader-track relative flex h-[clamp(10rem,36vw,13rem)] w-full items-center justify-center sm:h-52"
          style={{ containerType: 'inline-size' }}
        >
          {/* Órbita punteada exterior rotando */}
          <div className="absolute aspect-square w-[min(9rem,65%)] rounded-full border-2 border-dashed border-amber-400/50 animate-[spin_16s_linear_infinite] sm:w-40 sm:max-w-[55%]" />

          {/* Órbita secundaria con arco brillante */}
          <div className="absolute aspect-square w-[min(7rem,52%)] rounded-full border border-amber-500/30 animate-[spin_10s_linear_infinite_reverse] sm:w-32 sm:max-w-[45%]">
            <div className="w-3 h-3 rounded-full bg-amber-400 absolute -top-1.5 left-1/2 -translate-x-1/2 shadow-[0_0_12px_#F59E0B]" />
          </div>

          {/* Insignia / Logotipo de EventHive en el centro */}
          <div
            className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-xl transition-all duration-300 sm:h-20 sm:w-20 ${
              isDark
                ? 'bg-[#0B132B] border-amber-400/80 shadow-amber-500/20'
                : 'bg-white border-amber-400 shadow-amber-500/25'
            }`}
          >
            <img
              src="/LOGO45x50.png"
              alt="EventHive"
              className="h-9 w-9 object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] transition-transform hover:scale-105 sm:h-11 sm:w-11"
            />
          </div>

          {/* ABEJAS VOLANDO EN LÍNEA (4 abejas desfasadas siguiendo la misma trayectoria ondulada) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
            {[0, 1, 2, 3].map((idx) => {
              const delay = idx * 0.45; // Desfase temporal para que vuelen una detrás de otra en línea
              return (
                <div
                  key={idx}
                  className="hive-loader-bee absolute pointer-events-none"
                  style={{
                    animation: `beeFlyAcross 3.2s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
                    animationDelay: `${delay}s`,
                    willChange: 'transform, opacity',
                  }}
                >
                  {/* SVG de Abeja con alas revoloteando a alta velocidad */}
                  <div className="relative flex items-center">
                    {/* Estela de polen punteada detrás de cada abeja */}
                    <div className="flex items-center gap-1 -translate-x-3 opacity-60">
                      <span className="w-1 h-1 rounded-full bg-amber-400" />
                      <span className="w-0.5 h-0.5 rounded-full bg-amber-300" />
                    </div>

                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 40 40"
                      className="drop-shadow-[0_2px_6px_rgba(245,158,11,0.6)]"
                    >
                      {/* Ala Izquierda */}
                      <ellipse
                        cx="18"
                        cy="13"
                        rx="6"
                        ry="3.5"
                        fill="rgba(255, 255, 255, 0.85)"
                        stroke="#F59E0B"
                        strokeWidth="1"
                        style={{
                          transformOrigin: '18px 16px',
                          animation: 'beeWingFlapLeft 0.14s ease-in-out infinite',
                        }}
                      />
                      {/* Ala Derecha */}
                      <ellipse
                        cx="24"
                        cy="13"
                        rx="6"
                        ry="3.5"
                        fill="rgba(255, 255, 255, 0.85)"
                        stroke="#F59E0B"
                        strokeWidth="1"
                        style={{
                          transformOrigin: '22px 16px',
                          animation: 'beeWingFlapRight 0.14s ease-in-out infinite',
                        }}
                      />
                      {/* Cuerpo de la abeja (Rayas negras y amarillas) */}
                      <ellipse cx="20" cy="22" rx="10" ry="7" fill="#F59E0B" />
                      {/* Rayas negras */}
                      <path
                        d="M17 15.5 Q17 22 17 28.5"
                        stroke="#0F172A"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M21 15.2 Q21 22 21 28.8"
                        stroke="#0F172A"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M25 16.5 Q25 22 25 27.5"
                        stroke="#0F172A"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      />
                      {/* Cabeza */}
                      <circle cx="28" cy="22" r="4.2" fill="#0F172A" />
                      {/* Ojo brillante */}
                      <circle cx="29" cy="20.8" r="1.2" fill="#FFFFFF" />
                      {/* Antenas */}
                      <path
                        d="M30 18 Q32 15 34 16"
                        stroke="#0F172A"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        fill="none"
                      />
                      {/* Aguijón */}
                      <polygon points="10,22 8,21 8,23" fill="#0F172A" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. TEXTO "CARGANDO..." EN EL CENTRO */}
        <div className="mt-2 w-full min-w-0 text-center">
          <p
            className={`break-words text-base font-extrabold uppercase tracking-widest transition-colors sm:text-xl ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            {text}
          </p>

          {subtext && (
            <p className="mt-1 break-words text-xs font-medium text-amber-500/90 sm:text-sm">
              {subtext}
            </p>
          )}
        </div>

        {/* 5. BARRA DE PROGRESO CON COLOR AMBER / MIEL CORPORATIVO */}
        <div className="relative mt-4 h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-slate-300/40 shadow-inner dark:bg-white/10 sm:mt-5 sm:h-2 sm:max-w-64">
          <div
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
            style={{
              animation: 'honeyBarIndeterminate 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}
