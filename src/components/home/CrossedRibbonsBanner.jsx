import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * CrossedRibbonsBanner
 * Dos cintas cruzadas continuas con texto rotado (-2.5deg y +2.5deg),
 * ubicadas entre el carrusel principal y los eventos próximos.
 * Sin gradientes y sin emojis.
 */
export default function CrossedRibbonsBanner({ badgeText }) {
  const { t } = useLanguage();
  const resolvedBadge = badgeText || t('home.crossedRibbonDefault');
  const phrase1 = t('home.ribbonPhrase1');
  const phrase2 = t('home.ribbonPhrase2');

  // Repetir el texto ampliamente para garantizar cobertura total sin espacios vacíos en cualquier resolución
  const fullText1 = Array(8).fill(phrase1).join('');
  const fullText2 = Array(8).fill(phrase2).join('');

  return (
    <div id="proximos-banner" className="w-full py-10 sm:py-14 overflow-hidden select-none relative bg-transparent">
      <div className="relative w-full py-10 sm:py-12 my-1 overflow-hidden flex items-center justify-center">
        {/* Cinta 1: En modo claro azul oscuro con texto blanco; en modo oscuro blanca con letras negras */}
        <div
          className="absolute w-[140%] -left-[20%] py-3 sm:py-3.5 bg-[#0B132B] dark:bg-white text-white dark:text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-slate-800 dark:border-slate-200 pointer-events-none select-none z-1 transition-colors duration-200"
          style={{ transform: 'rotate(-2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex shrink-0" style={{ animationDuration: '85s' }}>
            <span className="shrink-0">{fullText1}</span>
            <span className="shrink-0">{fullText1}</span>
          </div>
        </div>

        {/* Cinta 2: Inclinada a +2.5 grados en color ámbar sólido */}
        <div
          className="absolute w-[140%] -left-[20%] py-3 sm:py-3.5 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-amber-400 pointer-events-none select-none z-2"
          style={{ transform: 'rotate(2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex shrink-0" style={{ animationDuration: '85s', animationDirection: 'reverse' }}>
            <span className="shrink-0">{fullText2}</span>
            <span className="shrink-0">{fullText2}</span>
          </div>
        </div>

        {/* Insignia central en el cruce de las líneas con el título "PRÓXIMOS EVENTOS" */}
        <div className="relative z-10 px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-white dark:bg-white border-2 border-slate-950 dark:border-slate-950 shadow-2xl transform hover:scale-105 transition-transform duration-200">
          <span className="text-xs sm:text-sm lg:text-base font-black text-slate-950 tracking-widest uppercase">
            {resolvedBadge}
          </span>
        </div>
      </div>
    </div>
  );
}
