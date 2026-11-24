import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import fuerteImg from '../../assets/fuerte.jpg';
import torreRelojImg from '../../assets/torre-reloj.png';
import colombiaImg from '../../assets/Colombia.jpg';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function CityRhythmPreFooter() {
  const { t } = useLanguage();

  return (
    <div className="w-full relative select-none my-8 sm:my-12">
      <section className="w-full bg-[#F5B800] text-slate-950 pt-12 sm:pt-14 lg:pt-16 pb-12 sm:pb-14 lg:pb-16 px-6 sm:px-10 lg:px-16 relative overflow-hidden shadow-2xl min-h-[440px] sm:min-h-[480px] flex items-center">

        {/* Resplandores ambientales cálidos sutiles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-amber-400/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">

          {/* Columna Izquierda: 3 Fotografías a todo color con encuadre limpio (border-radius: 16px) y ligera superposición orgánica */}
          <div className="lg:col-span-5 flex items-center justify-center relative py-2 sm:py-4 z-20">
            <div className="relative w-72 sm:w-88 md:w-[420px] h-72 sm:h-80 md:h-84 flex items-center justify-center group">

              {/* CARTA 1 (Izquierda): Inclinada a la izquierda (-26°), debajo de la central */}
              <div
                className="absolute origin-bottom-right transition-all duration-300 ease-out cursor-pointer z-10
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-[#0F2342] bg-[#0F2342] shadow-[0_20px_45px_rgba(15,35,66,0.4)]
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2342]/90 via-[#0F2342]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-[#0F2342]/85 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-[#F5B800] block truncate">
                    {t('home.card1Title', 'Fuerte San Fernando')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card1Subtitle', 'Bocachica')}
                  </span>
                </div>
              </div>

              {/* CARTA 2 (Centro): Completamente vertical (0°), sobre la izquierda y bajo la derecha */}
              <div
                className="absolute origin-bottom transition-all duration-300 ease-out cursor-pointer z-20
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-[#0F2342] bg-[#0F2342] shadow-[0_25px_45px_rgba(15,35,66,0.45)]
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2342]/90 via-[#0F2342]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-[#0F2342]/90 backdrop-blur-2xs border-t border-[#F5B800]/50">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-[#F5B800] block truncate">
                    {t('home.card2Title', 'Torre del Reloj')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card2Subtitle', 'Centro Histórico')}
                  </span>
                </div>
              </div>

              {/* CARTA 3 (Derecha): Inclinada a la derecha (+26°), por encima de la central */}
              <div
                className="absolute origin-bottom-left transition-all duration-300 ease-out cursor-pointer z-30
                           w-36 sm:w-44 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden
                           border-2 border-[#0F2342] bg-[#0F2342] shadow-[0_25px_50px_rgba(15,35,66,0.5)]
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2342]/90 via-[#0F2342]/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-[#0F2342]/85 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-[#F5B800] block truncate">
                    {t('home.card3Title', 'Bahía de Cartagena')}
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    {t('home.card3Subtitle', 'Manga')}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Columna Derecha: Nueva Puesta en Escena Tipográfica Monumental (Misma tipografía del Home) */}
          <div className="lg:col-span-7 flex flex-col justify-center w-full relative z-10 select-none py-2 lg:py-3">

            {/* Elemento Gráfico Ambiental Sutil de Fondo: Onda Sonora Minimalista y 01 / CARTAGENA */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 overflow-hidden flex items-center justify-end w-full max-w-lg">
              <span className="font-display font-black text-[5.5rem] sm:text-[7.5rem] lg:text-[9.5rem] tracking-tighter text-[#0F2342]/[0.06] uppercase leading-none whitespace-nowrap select-none mr-2">
                01
              </span>
              {/* Onda sonora minimalista en SVG de líneas finas en rgba(15, 35, 66, 0.08) */}
              <svg
                width="180"
                height="100"
                viewBox="0 0 180 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-[#0F2342] opacity-[0.12] hidden sm:block shrink-0"
                aria-hidden="true"
              >
                <line x1="8" y1="35" x2="8" y2="65" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="18" y1="22" x2="18" y2="78" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="28" y1="40" x2="28" y2="60" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="38" y1="15" x2="38" y2="85" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="48" y1="28" x2="48" y2="72" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="58" y1="10" x2="58" y2="90" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="68" y1="32" x2="68" y2="68" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="78" y1="20" x2="78" y2="80" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="88" y1="8" x2="88" y2="92" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="98" y1="24" x2="98" y2="76" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="108" y1="38" x2="108" y2="62" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="118" y1="16" x2="118" y2="84" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="128" y1="30" x2="128" y2="70" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="138" y1="42" x2="138" y2="58" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="148" y1="22" x2="148" y2="78" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="158" y1="34" x2="158" y2="66" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="168" y1="45" x2="168" y2="55" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Kicker Superior de Ambiente */}
            <div className="relative z-10 flex items-center gap-2 mb-2 sm:mb-2.5 text-[#0F2342]/75 font-mono text-[10px] sm:text-xs tracking-[0.25em] uppercase font-bold">
              <span className="w-6 sm:w-10 h-px bg-[#0F2342]/35" />
              <span>CARTAGENA DE INDIAS • EN VIVO</span>
              <span className="w-6 sm:w-10 h-px bg-[#0F2342]/35" />
            </div>

            {/* Titular Principal Monumental Llenando de lado a lado con Contraste Bicolor #0F2342 / #FFFFFF */}
            <h2
              className="relative z-10 font-display font-black tracking-[-0.02em] uppercase"
              style={{
                fontSize: 'clamp(2rem, 3.6vw, 3.25rem)',
                lineHeight: 1.05,
              }}
            >
              <span className="text-[#0F2342] block">EL RITMO DE LA CIUDAD</span>
              <span className="text-white drop-shadow-sm block">EN UN SOLO LUGAR</span>
            </h2>

            {/* Subtítulo y Datos en Retícula Abierta de 2 Columnas separadas por líneas divisorias finas (Sin cajas ni badges) */}
            <div
              className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(15, 35, 66, 0.25)' }}
            >
              <div className="space-y-1">
                <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider block">
                  +150 Eventos en vivo
                </span>
                <p className="text-xs sm:text-[13px] text-[#0F2342]/85 leading-snug">
                  Festivales, música y cultura para vibrar en cada rincón de la Heroica.
                </p>
              </div>

              <div className="space-y-1 sm:border-l sm:pl-6" style={{ borderColor: 'rgba(15, 35, 66, 0.25)' }}>
                <span className="font-mono text-xs font-bold text-[#0F2342] uppercase tracking-wider block">
                  Acceso 100% digital
                </span>
                <p className="text-xs sm:text-[13px] text-[#0F2342]/85 leading-snug">
                  Entradas seguras y verificadas con código QR al instante en tu móvil.
                </p>
              </div>
            </div>

            {/* Acción Llamativa: Botón Píldora Sólido (#0F2342) con Texto Blanco (#FFFFFF) + Flecha Animada + Micro-frase */}
            <div className="relative z-10 flex flex-wrap items-center gap-3.5 sm:gap-4 pt-5 mt-2">
              <Link
                to="/eventos"
                className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-[#0F2342] text-white font-bold text-xs sm:text-sm shadow-xl shadow-[#0F2342]/20 hover:bg-[#162e56] hover:shadow-2xl transition-all duration-200 cursor-pointer"
              >
                <span>Explorar cartelera</span>
                <FiArrowRight className="text-base transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <span className="text-xs font-semibold text-[#0F2342]/85 tracking-wide">
                Boletos oficiales • Sin filas ni recargos sorpresa
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Divisor de Ondas Fluidas (Waves) en dorado ámbar (#F5B800) para transición perfecta */}
      <div className="w-full overflow-hidden leading-none -mt-px pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-14 md:h-18 lg:h-22 block"
          aria-hidden="true"
        >
          <path
            fill="#F5B800"
            fillOpacity="1"
            d="M0,320L60,277.3C120,235,240,149,360,138.7C480,128,600,192,720,197.3C840,203,960,149,1080,138.7C1200,128,1320,160,1380,176L1440,192L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
          />
        </svg>
      </div>
    </div>
  );
}
