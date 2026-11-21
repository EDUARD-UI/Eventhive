import React from 'react';
import fuerteImg from '../../assets/fuerte.jpg';
import torreRelojImg from '../../assets/torre-reloj.png';
import colombiaImg from '../../assets/Colombia.jpg';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function CityRhythmPreFooter() {
  const { t } = useLanguage();

  return (
    <div className="w-full relative select-none my-8 sm:my-12">
      <section className="w-full bg-gradient-to-b from-[#E08500] via-[#D97706] to-[#C86A00] text-slate-950 pt-14 sm:pt-16 lg:pt-20 pb-14 sm:pb-16 lg:pb-20 px-6 sm:px-10 lg:px-16 relative overflow-visible shadow-2xl min-h-[440px] sm:min-h-[480px] flex items-center">

        {/* Resplandores ambientales cálidos */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-yellow-200/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">

          {/* Columna Izquierda: Cartas con su animación y perspectiva original completa */}
          <div className="lg:col-span-5 flex items-center justify-center relative py-4 sm:py-6 z-20">
            <div className="relative w-72 sm:w-88 md:w-[420px] h-72 sm:h-80 md:h-88 flex items-center justify-center group">

              {/* CARTA 1 (Izquierda): Inclinada a la izquierda (-26°), debajo de la central */}
              <div
                className="absolute origin-bottom-right transition-all duration-300 ease-out cursor-pointer z-10
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-slate-900 bg-slate-900 shadow-[0_20px_45px_rgba(0,0,0,0.5)]
                           -rotate-[26deg] -translate-x-14 sm:-translate-x-20 md:-translate-x-24 -translate-y-4 sm:-translate-y-6
                           group-hover:-rotate-[30deg] group-hover:-translate-x-18 sm:group-hover:-translate-x-26 group-hover:scale-105"
              >
                <img
                  src={fuerteImg}
                  alt="Fuerte San Fernando, Cartagena"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/80 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    {t('home.card1Title')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card1Subtitle')}
                  </span>
                </div>
              </div>

              {/* CARTA 2 (Centro): Completamente vertical (0°), sobre la izquierda y bajo la derecha */}
              <div
                className="absolute origin-bottom transition-all duration-300 ease-out cursor-pointer z-20
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-slate-900 bg-slate-900 shadow-[0_25px_45px_rgba(0,0,0,0.55)]
                           rotate-0 -translate-y-8 sm:-translate-y-12
                           group-hover:-translate-y-14 group-hover:scale-105"
              >
                <img
                  src={torreRelojImg}
                  alt="Torre del Reloj, Cartagena"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-[center_25%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/85 backdrop-blur-2xs border-t border-amber-400/50">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    {t('home.card2Title')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card2Subtitle')}
                  </span>
                </div>
              </div>

              {/* CARTA 3 (Derecha): Inclinada a la derecha (+26°), por encima de la central */}
              <div
                className="absolute origin-bottom-left transition-all duration-300 ease-out cursor-pointer z-30
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-slate-900 bg-slate-900 shadow-[0_25px_50px_rgba(0,0,0,0.6)]
                           rotate-[26deg] translate-x-14 sm:translate-x-20 md:translate-x-24 -translate-y-4 sm:-translate-y-6
                           group-hover:rotate-[30deg] group-hover:translate-x-18 sm:group-hover:translate-x-26 group-hover:scale-105"
              >
                <img
                  src={colombiaImg}
                  alt="Bahía de Cartagena"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/80 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    {t('home.card3Title')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card3Subtitle')}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Columna Derecha: Composición editorial inspirada en diseño de cartelería y arquitectura urbana */}
          <div className="lg:col-span-7 flex flex-col justify-center w-full relative z-10 select-none py-2 lg:py-4">
            
            {/* Kicker superior editorial (estilo cartel / arquitectura urbana) */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3 text-slate-950/65 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold">
              <span className="w-6 sm:w-10 h-px bg-slate-950/40" />
              <span>CARTAGENA DE INDIAS • RITMO & CULTURA</span>
              <span className="w-6 sm:w-10 h-px bg-slate-950/40" />
            </div>

            <div className="w-full flex flex-col space-y-1 sm:space-y-1.5 lg:space-y-2">
              {/* Frase 1: Estilo opaco / delineado (outline ghost), alineada a la izquierda */}
              <div className="w-full flex justify-start">
                <span
                  className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[58px] 2xl:text-[66px] tracking-tight uppercase leading-[0.92] select-none transition-all duration-300 hover:opacity-85"
                  style={{
                    WebkitTextStroke: '1.5px rgba(15, 23, 42, 0.45)',
                    color: 'rgba(15, 23, 42, 0.15)',
                  }}
                >
                  {t('home.preFooterFaint1', 'EXPERIENCIAS ÚNICAS')}
                </span>
              </div>

              {/* Frase 2 (Central): Protagonista negro puro de alto impacto, desplazado marcadamente a la derecha */}
              <div className="w-full flex justify-end pr-1 sm:pr-4 lg:pr-8 xl:pr-10">
                <h2
                  className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[84px] xl:text-[102px] 2xl:text-[114px] tracking-tighter text-slate-950 uppercase leading-[0.88] drop-shadow-sm select-none py-0.5 sm:py-1 transition-transform duration-300 hover:scale-[1.01]"
                >
                  EVENTHIVE
                </h2>
              </div>

              {/* Frase 3: Estilo opaco / delineado (outline ghost), alineada hacia la izquierda con sutil sangría */}
              <div className="w-full flex justify-start pl-2 sm:pl-6 lg:pl-8">
                <span
                  className="font-display font-black text-2xl sm:text-4xl md:text-5xl lg:text-[48px] xl:text-[58px] 2xl:text-[66px] tracking-tight uppercase leading-[0.92] select-none transition-all duration-300 hover:opacity-85"
                  style={{
                    WebkitTextStroke: '1.5px rgba(15, 23, 42, 0.45)',
                    color: 'rgba(15, 23, 42, 0.15)',
                  }}
                >
                  {t('home.preFooterFaint2', 'QUÉ VACILE')}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Divisor de Ondas Fluidas (Waves) en dorado ámbar (#C86A00) */}
      <div className="w-full overflow-hidden leading-none -mt-px pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-18 lg:h-22 block"
          aria-hidden="true"
        >
          <path
            fill="#C86A00"
            fillOpacity="1"
            d="M0,320L60,277.3C120,235,240,149,360,138.7C480,128,600,192,720,197.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>
      </div>
    </div>
  );
}
