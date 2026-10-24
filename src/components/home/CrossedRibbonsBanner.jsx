import React, { useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useLenisScrollEffect } from '../../hooks/useLenisScroll.js';

/**
 * CrossedRibbonsBanner
 * Dos cintas cruzadas continuas con texto rotado (-2.5deg y +2.5deg),
 * animadas con smooth scroll mediante el motor Lenis.
 * Al ir bajando la página las barras se van cruzando en direcciones opuestas
 * y mostrándose de forma suave, manteniendo los textos idénticos.
 */
export default function CrossedRibbonsBanner({ badgeText }) {
  const { t } = useLanguage();
  const phrase1 = t('home.ribbonPhrase1');
  const phrase2 = t('home.ribbonPhrase2');

  const containerRef = useRef(null);
  const ribbon1Ref = useRef(null);
  const ribbon2Ref = useRef(null);

  // Repetir el texto ampliamente para garantizar cobertura total sin espacios vacíos en cualquier resolución
  const fullText1 = Array(8).fill(phrase1).join('');
  const fullText2 = Array(8).fill(phrase2).join('');

  // Sincronizar desplazamiento dinámico fluido de las cintas cruzadas con el motor Lenis
  useLenisScrollEffect(() => {
    if (!containerRef.current || !ribbon1Ref.current || !ribbon2Ref.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight || 800;

    // Optimización: omitir cómputo si está fuera del rango visible
    if (rect.bottom < -200 || rect.top > windowHeight + 200) return;

    // Progreso de entrada para que al ir bajando se vayan mostrando gradualmente
    const enterProgress = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 0.4)));

    // Cálculo respecto al centro del viewport (-1 a +1)
    const centerOffset = (windowHeight / 2) - (rect.top + rect.height / 2);
    const normalized = Math.max(-1.6, Math.min(1.6, centerOffset / (windowHeight * 0.65)));

    // Desplazamiento horizontal opuesto: las barras se van cruzando en direcciones inversas al hacer scroll
    const shift1 = normalized * 170;  // Cinta 1 avanza en un sentido
    const shift2 = -normalized * 170; // Cinta 2 avanza en sentido opuesto

    ribbon1Ref.current.style.transform = `translate3d(${shift1}px, 0, 0) rotate(-2.5deg)`;
    ribbon2Ref.current.style.transform = `translate3d(${shift2}px, 0, 0) rotate(2.5deg)`;

    // Suavizado de revelado sin alterar textos
    containerRef.current.style.opacity = `${0.3 + enterProgress * 0.7}`;
    containerRef.current.style.transform = `scale(${0.97 + enterProgress * 0.03})`;
  });

  return (
    <div
      id="proximos-banner"
      ref={containerRef}
      className="w-full py-10 sm:py-14 overflow-hidden select-none relative bg-transparent will-change-transform transition-opacity duration-300"
    >
      <div className="relative w-full py-10 sm:py-12 my-1 overflow-hidden flex items-center justify-center">
        {/* Cinta 1: Inclinada a -2.5deg, se desplaza en un sentido al hacer scroll */}
        <div
          ref={ribbon1Ref}
          className="absolute w-[180%] -left-[40%] py-3 sm:py-3.5 bg-[#0B132B] dark:bg-white text-white dark:text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-slate-800 dark:border-slate-200 pointer-events-none select-none z-1 transition-colors duration-200 will-change-transform"
          style={{ transform: 'rotate(-2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex shrink-0" style={{ animationDuration: '85s' }}>
            <span className="shrink-0">{fullText1}</span>
            <span className="shrink-0">{fullText1}</span>
          </div>
        </div>

        {/* Cinta 2: Inclinada a +2.5deg, se desplaza en sentido opuesto cruzándose con la cinta 1 */}
        <div
          ref={ribbon2Ref}
          className="absolute w-[180%] -left-[40%] py-3 sm:py-3.5 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl flex items-center overflow-hidden border-y border-amber-400 pointer-events-none select-none z-2 will-change-transform"
          style={{ transform: 'rotate(2.5deg)' }}
        >
          <div className="whitespace-nowrap animate-marquee flex shrink-0" style={{ animationDuration: '85s', animationDirection: 'reverse' }}>
            <span className="shrink-0">{fullText2}</span>
            <span className="shrink-0">{fullText2}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
