import React from 'react';

/**
 * CategoryRibbonBanner
 * Barra individual dorada ámbar para la sección de categorías:
 * - Recta de borde a borde (sin esquinas cortadas o comidas).
 * - Patrón: "CATEGORÍAS - [isotipo] - [isotipo] - CATEGORÍAS" repetido continuamente.
 * - Isotipo idéntico al favicon oficial (/LOGO32x32.png).
 * - Estática y continua sin espacios vacíos.
 */
export default function CategoryRibbonBanner() {
  const repetitions = Array.from({ length: 24 });

  return (
    <div className="w-full overflow-hidden select-none relative my-6 pointer-events-none py-1">
      <div className="w-full relative py-2.5 sm:py-3.5 bg-amber-500 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest shadow-md border-y border-amber-400 flex items-center justify-center overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
          {repetitions.map((_, i) => (
            <React.Fragment key={i}>
              <span className="tracking-widest font-black text-slate-950">
                CATEGORÍAS
              </span>
              <img
                src="/LOGO32x32.png"
                alt=""
                className="h-5 sm:h-6 w-auto object-contain shrink-0 inline-block drop-shadow-2xs"
              />
              <img
                src="/LOGO32x32.png"
                alt=""
                className="h-5 sm:h-6 w-auto object-contain shrink-0 inline-block drop-shadow-2xs"
              />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
