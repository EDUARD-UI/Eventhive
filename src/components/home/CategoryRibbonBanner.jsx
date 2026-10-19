import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * CategoryRibbonBanner
 * Barra inclinada continua de categorías con nombres estáticos divididos por el logo de Eventhive.
 * En modo oscuro adopta un fondo dorado ámbar con logos en blanco.
 * En el centro incluye la insignia fija con el título "CATEGORÍAS".
 */
export default function CategoryRibbonBanner() {
  const { language } = useLanguage();

  const isEn = language === 'en';
  const centerTitle = isEn ? 'CATEGORIES' : 'CATEGORÍAS';

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

  // Generamos un bloque repetible para el marquee continuo
  const repeatedItems = Array(4).fill(categories).flat();

  return (
    <div className="w-full overflow-hidden select-none relative min-h-[140px] sm:min-h-[170px] flex items-center justify-center">
      {/* Barra inclinada continua que se extiende 150vw centrada simétricamente */}
      <div
        style={{
          width: '150vw',
          minWidth: '150vw',
          transform: 'rotate(-2.4deg)',
          transformOrigin: 'center center',
        }}
        className="py-3 sm:py-3.5 bg-[#0B132B] text-white border-y-2 border-slate-900 shadow-xl dark:bg-amber-500 dark:text-slate-950 dark:border-amber-400 flex items-center overflow-hidden shrink-0 transition-colors duration-300 pointer-events-none select-none z-1"
      >
        <div
          className="whitespace-nowrap animate-marquee flex items-center shrink-0"
          style={{ animationDuration: '65s' }}
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

      {/* Insignia central en el medio de la barra con el título "CATEGORÍAS" estilo barras cruzadas */}
      <div className="relative z-10 px-6 sm:px-8 py-2 sm:py-2.5 rounded-2xl bg-white dark:bg-[#0B132B] border-2 border-slate-950 dark:border-amber-400 shadow-2xl transform hover:scale-105 transition-transform duration-200 pointer-events-auto">
        <span className="text-xs sm:text-sm lg:text-base font-black text-slate-950 dark:text-amber-400 tracking-widest uppercase">
          {centerTitle}
        </span>
      </div>
    </div>
  );
}

