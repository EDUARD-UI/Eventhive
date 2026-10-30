import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * CategoryRibbonBanner
 * Barra inclinada interactiva de categorías con estética cinética (inspirada en Blendo):
 * - Reacciona al progreso del scroll con un ligero balanceo de ángulo e insignias flotantes.
 * - En modo oscuro adopta un fondo dorado ámbar vibrante; en claro, azul noche profundo.
 * - Incluye stickers flotantes animados en 3D alrededor de la insignia central.
 */
export default function CategoryRibbonBanner() {
  const { language } = useLanguage();
  const bannerRef = useRef(null);
  const [scrollTilt, setScrollTilt] = useState(0);

  const isEn = language === 'en';
  const centerTitle = isEn ? 'CATEGORIES' : 'CATEGORÍAS';

  useEffect(() => {
    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!bannerRef.current) return;
        const rect = bannerRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const norm = (vh / 2 - rect.top) / vh;
        const clamped = Math.max(-1, Math.min(1, norm));
        setScrollTilt(clamped);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const categories = isEn
    ? [
        'Festivals',
        'Concerts',
        'Sports & Beach',
        'Gastronomy',
        'Art & Culture',
        'Nightlife',
        'Live Music',
        'Community & Hive',
      ]
    : [
        'Festivales',
        'Conciertos',
        'Deportes y Playa',
        'Gastronomía',
        'Arte y Cultura',
        'Vida Nocturna',
        'Música en Vivo',
        'Comunidad & Hive',
      ];

  const repeatedItems = Array(4).fill(categories).flat();
  const dynamicAngle = -2.4 + scrollTilt * 1.2;

  return (
    <div
      ref={bannerRef}
      className="w-full overflow-hidden select-none relative min-h-[155px] sm:min-h-[185px] flex items-center justify-center"
    >
      {/* Destellos flotantes ambientales estilo Blendo detrás de la cinta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-amber-400/20 dark:bg-amber-500/15 blur-2xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-blue-500/15 dark:bg-amber-300/10 blur-2xl"
      />

      {/* Cinta secundaria en contra-ángulo sutil para dar volumen 3D */}
      <div
        aria-hidden="true"
        style={{
          width: '150vw',
          minWidth: '150vw',
          transform: `rotate(${(2.1 - scrollTilt * 1.1).toFixed(2)}deg)`,
          transformOrigin: 'center center',
        }}
        className="absolute py-2.5 bg-amber-500/20 dark:bg-white/[0.05] border-y border-amber-500/30 dark:border-white/10 pointer-events-none select-none z-0 transition-transform duration-150 ease-out"
      />

      {/* Barra inclinada principal continua que reacciona suavemente al scroll */}
      <div
        style={{
          width: '150vw',
          minWidth: '150vw',
          transform: `rotate(${dynamicAngle.toFixed(2)}deg)`,
          transformOrigin: 'center center',
        }}
        className="py-3.5 sm:py-4 bg-[#0B132B] text-white border-y-2 border-slate-900 shadow-2xl dark:bg-amber-500 dark:text-slate-950 dark:border-amber-300 flex items-center overflow-hidden shrink-0 transition-colors duration-300 pointer-events-none select-none z-10"
      >
        <div
          className="whitespace-nowrap animate-marquee flex items-center shrink-0"
          style={{ animationDuration: '58s' }}
        >
          {repeatedItems.map((catName, index) => (
            <div key={index} className="flex items-center gap-4 sm:gap-6 px-3 sm:px-4 shrink-0">
              <span className="tracking-widest font-black text-xs sm:text-sm uppercase">
                {catName}
              </span>
              <img
                src="/LOGO32x32.png"
                alt="Eventhive Logo"
                className="h-5 sm:h-6 w-auto object-contain shrink-0 inline-block drop-shadow-xs dark:brightness-0 dark:invert transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Insignia central tridimensional con stickers flotantes estilo Blendo */}
      <div className="relative z-20 flex items-center justify-center">
        {/* Sticker flotante superior izquierdo */}
        <span
          style={{
            transform: `translate3d(-12px, ${(-6 + scrollTilt * -6).toFixed(1)}px, 0) rotate(-8deg)`,
          }}
          className="hidden sm:inline-flex items-center gap-1 absolute -top-5 -left-12 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md border border-slate-950 transition-transform duration-200 pointer-events-none"
        >
          ★ TOP VIBE
        </span>

        <div className="px-7 sm:px-9 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-[#0B132B] border-2 border-slate-950 dark:border-amber-400 shadow-[0_8px_0_0_rgba(15,23,42,1)] dark:shadow-[0_6px_0_0_rgba(245,158,11,0.85)] transform hover:scale-105 hover:-rotate-1 transition-all duration-200 pointer-events-auto">
          <span className="text-xs sm:text-sm lg:text-base font-black text-slate-950 dark:text-amber-400 tracking-widest uppercase">
            {centerTitle}
          </span>
        </div>

        {/* Sticker flotante inferior derecho */}
        <span
          style={{
            transform: `translate3d(12px, ${(6 + scrollTilt * 6).toFixed(1)}px, 0) rotate(7deg)`,
          }}
          className="hidden sm:inline-flex items-center gap-1 absolute -bottom-5 -right-12 px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md border border-slate-950 transition-transform duration-200 pointer-events-none"
        >
          ⬡ EXPLORA
        </span>
      </div>
    </div>
  );
}
