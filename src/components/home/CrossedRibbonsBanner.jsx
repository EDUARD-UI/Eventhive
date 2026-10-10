import React from 'react';

/**
 * CrossedRibbonsBanner
 * Dos cintas cruzadas continuas con texto rotado (-2.5deg y +2.5deg),
 * ubicadas entre el carrusel principal y los eventos próximos.
 * Sin gradientes y sin emojis.
 */
export default function CrossedRibbonsBanner({ badgeText = 'CARTAGENA EN VIVO' }) {
  const ribbonText1 =
    'EVENTHIVE • CARTAGENA • VIVE LA EXPERIENCIA • ARTE Y CULTURA • MÚSICA EN VIVO • GASTRONOMÍA • EVENTHIVE • CARTAGENA • VIVE LA EXPERIENCIA • ARTE Y CULTURA • MÚSICA EN VIVO • GASTRONOMÍA • ';
  const ribbonText2 =
    'CONÉCTATE AL RITMO DE LA CIUDAD • TU BOLETERÍA DIGITAL • EXPERIENCIAS EXCLUSIVAS • CARTAGENA DE INDIAS • CONÉCTATE AL RITMO DE LA CIUDAD • TU BOLETERÍA DIGITAL • EXPERIENCIAS EXCLUSIVAS • CARTAGENA DE INDIAS • ';

  return (
    <div className="w-full py-12 sm:py-16 overflow-hidden select-none relative bg-transparent">
      <div className="relative w-full py-10 sm:py-12 my-1 overflow-hidden flex items-center justify-center">
        {/* Cinta 1: Inclinada a -2.5 grados en negro / slate-950 */}
        <div
          className="absolute w-[120%] -left-[10%] py-3 sm:py-3.5 bg-slate-950 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-slate-800 pointer-events-none select-none z-1"
          style={{ transform: 'rotate(-2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex">
            <span>{ribbonText1}</span>
            <span>{ribbonText1}</span>
          </div>
        </div>

        {/* Cinta 2: Inclinada a +2.5 grados en color ámbar sólido */}
        <div
          className="absolute w-[120%] -left-[10%] py-3 sm:py-3.5 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-amber-400 pointer-events-none select-none z-2"
          style={{ transform: 'rotate(2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex" style={{ animationDirection: 'reverse' }}>
            <span>{ribbonText2}</span>
            <span>{ribbonText2}</span>
          </div>
        </div>

        {/* Insignia central en el cruce de las líneas */}
        <div className="relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-[#0B132B] border-2 border-slate-950 dark:border-amber-400 shadow-2xl transform hover:scale-105 transition-transform duration-200">
          <span className="text-xs sm:text-sm lg:text-base font-black text-slate-950 dark:text-white tracking-widest uppercase">
            {badgeText}
          </span>
        </div>
      </div>
    </div>
  );
}
