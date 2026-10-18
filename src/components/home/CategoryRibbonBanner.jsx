import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * CategoryRibbonBanner
 * Barra inclinada para la sección de categorías:
 * - Ángulo inclinado elegante (hasta 25° máx, calibrado a -3.5° para óptima legibilidad).
 * - Blanco en tema oscuro (dark:bg-white dark:text-slate-950 dark:border-white).
 * - Azul oscuro en tema claro (bg-[#0B132B] text-white border-slate-900).
 * - Sobresale a los extremos (w-[150%] -left-[25%]) para garantizar que los bordes pasen rectos sin esquinas comidas.
 * - Patrón: "CATEGORÍAS - [isotipo] - [isotipo] - CATEGORÍAS" continuo sin huecos.
 * - Isotipo idéntico al favicon (/LOGO32x32.png).
 */
export default function CategoryRibbonBanner() {
  const { t } = useLanguage();
  const repetitions = Array.from({ length: 28 });

  return (
    <div className="w-full overflow-hidden select-none relative min-h-[140px] sm:min-h-[170px] flex items-center justify-center pointer-events-none">
      {/* Barra inclinada continua que se extiende 150vw centrada simétricamente para no cortarse jamás */}
      <div
        style={{
          width: '150vw',
          minWidth: '150vw',
          transform: 'rotate(-2.4deg)',
          transformOrigin: 'center center',
        }}
        className="py-3 sm:py-4 bg-[#0B132B] text-white border-y-2 border-slate-900 shadow-xl dark:bg-white dark:text-slate-950 dark:border-white flex items-center justify-center overflow-hidden shrink-0 transition-colors duration-300"
      >
        <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
          {repetitions.map((_, i) => (
            <React.Fragment key={i}>
              <span className="tracking-widest font-black text-xs sm:text-sm uppercase">
                {t('home.categoriesBanner')}
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
