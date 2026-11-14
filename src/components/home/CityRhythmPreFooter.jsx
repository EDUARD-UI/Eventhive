import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import fuerteImg from '../../assets/fuerte.jpg';
import torreRelojImg from '../../assets/torre-reloj.png';
import colombiaImg from '../../assets/Colombia.jpg';
import { useLanguage } from '../../context/LanguageContext.jsx';

const RHYTHM_WORDS = ['el picó', 'tu parche', 'conciertos', 'el vacile', 'tu cultura'];

function useTypewriter(words, { typingSpeed = 90, deletingSpeed = 45, pauseDuration = 1600 } = {}) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[index % words.length];

    if (!isDeleting && subIndex === currentWord.length) {
      const pause = setTimeout(() => setIsDeleting(true), pauseDuration);
      return () => clearTimeout(pause);
    }

    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, index, words, typingSpeed, deletingSpeed, pauseDuration]);

  const currentWord = words[index % words.length];
  return currentWord.substring(0, subIndex);
}

export default function CityRhythmPreFooter() {
  const { t } = useLanguage();
  const typedWord = useTypewriter(RHYTHM_WORDS);

  return (
    <div className="w-full relative select-none my-8 sm:my-12">
      <section className="w-full bg-gradient-to-b from-[#E08500] via-[#D97706] to-[#C86A00] text-slate-950 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 px-6 sm:px-10 lg:px-16 relative overflow-visible shadow-2xl min-h-[440px] sm:min-h-[480px] flex items-center">

        {/* Resplandores ambientales cálidos */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-yellow-200/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

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

          {/* Columna Derecha: Typewriter + Subtítulo del Hero + CTA agrandados para tomar todo el espacio */}
          <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left space-y-4 sm:space-y-5 lg:pl-6 relative z-10">
            {/* Titular Typewriter grande y llamativo */}
            <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[46px] 2xl:text-[50px] tracking-tight text-slate-950 uppercase leading-[1.12] max-w-2xl drop-shadow-2xs">
              <span className="block sm:whitespace-nowrap">VIVE CARTAGENA AL RITMO</span>
              <span className="block whitespace-nowrap mt-1 sm:mt-1.5 min-h-[1.25em]">
                <span>DE </span>
                <span className="text-white drop-shadow-xs inline-flex items-baseline">
                  <span>{typedWord || '\u00A0'}</span>
                  <span className="inline-block w-1 sm:w-1.5 h-[0.8em] bg-slate-950 ml-1.5 align-middle animate-pulse" aria-hidden="true" />
                </span>
              </span>
            </h2>

            {/* Subtítulo idéntico al Hero en tamaño generoso */}
            <p className="text-sm sm:text-base md:text-lg lg:text-[17px] font-medium text-slate-950/95 leading-relaxed max-w-xl">
              {t(
                'hero.subtitle',
                'Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la mágica Cartagena de Indias. Vive cada momento al máximo.'
              )}
            </p>

            {/* Botón CTA */}
            <div className="pt-2 w-full flex justify-center lg:justify-start">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              >
                <span>{t('home.preFooterCta')}</span>
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                  <FiArrowRight size={14} strokeWidth={2.8} />
                </span>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          Divisor de Picos / Festón festoneado (Scallop) en dorado ámbar (#C86A00)
          hacia el Footer, con ondas de repetición.
         ========================================================================= */}
      <div className="w-full overflow-hidden leading-none -mt-px pointer-events-none">
        <svg
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          className="w-full h-5 sm:h-7 md:h-8 block fill-[#C86A00]"
          aria-hidden="true"
        >
          <path d="M 0,0 L 0,4 Q 25,24 50,4 Q 75,24 100,4 Q 125,24 150,4 Q 175,24 200,4 Q 225,24 250,4 Q 275,24 300,4 Q 325,24 350,4 Q 375,24 400,4 Q 425,24 450,4 Q 475,24 500,4 Q 525,24 550,4 Q 575,24 600,4 Q 625,24 650,4 Q 675,24 700,4 Q 725,24 750,4 Q 775,24 800,4 Q 825,24 850,4 Q 875,24 900,4 Q 925,24 950,4 Q 975,24 1000,4 Q 1025,24 1050,4 Q 1075,24 1100,4 Q 1125,24 1150,4 Q 1175,24 1200,4 L 1200,0 Z" />
        </svg>
      </div>
    </div>
  );
}
