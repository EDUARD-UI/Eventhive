import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import fuerteImg from '../../assets/fuerte.jpg';
import torreRelojImg from '../../assets/torre-reloj.png';
import colombiaImg from '../../assets/Colombia.jpg';

/**
 * CityRhythmPreFooter
 * - Tres cartas coleccionables apiladas según el diagrama del usuario,
 *   sobresaliendo ligeramente por encima del contenedor superior ("que salgan un poquito"):
 *   1. Carta izquierda: inclinada a la izquierda (~ -26°), por debajo de la central (z-10).
 *   2. Carta central: recta vertical (0°), sobre la izquierda y bajo la derecha (z-20).
 *   3. Carta derecha: inclinada a la derecha (~ +26°), por encima de la central (z-30).
 * - Fondo dorado ámbar (#D97706 / #E08500) fijo en modo claro y oscuro.
 * - Textos y botón a la derecha.
 * - Festón inferior de picos / ondas (scallop) en dorado ámbar hacia el Footer.
 */
export default function CityRhythmPreFooter() {
  return (
    <div className="w-full relative select-none mt-20 sm:mt-28 md:mt-36">
      <section className="w-full bg-gradient-to-b from-[#E08500] via-[#D97706] to-[#C86A00] text-slate-950 pt-10 sm:pt-14 pb-12 sm:pb-16 px-6 sm:px-10 lg:px-16 relative overflow-visible shadow-2xl">
        
        {/* Resplandores ambientales cálidos */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-yellow-200/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Columna Izquierda: Cartas que sobresalen generosamente por la parte superior ("que salgan un poquito más") */}
          <div className="lg:col-span-6 flex items-center justify-center relative -mt-24 sm:-mt-32 md:-mt-40 z-20">
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
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/80 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    Fuerte San Fernando
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    Bocachica
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
                  className="w-full h-full object-cover object-[center_25%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/85 backdrop-blur-2xs border-t border-amber-400/50">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    Torre del Reloj
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    Centro Histórico
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
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 p-2 sm:p-2.5 text-center bg-slate-950/80 backdrop-blur-2xs border-t border-white/20">
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-wider text-amber-300 block truncate">
                    Bahía de Cartagena
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-slate-200 font-semibold block">
                    Caribe Colombiano
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Columna Derecha: "texto aqui" y "boton aqui" según el diagrama */}
          <div className="lg:col-span-6 flex flex-col items-start text-left space-y-4 lg:pl-6 relative z-10">
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-slate-950 uppercase leading-tight max-w-lg drop-shadow-2xs">
              Conéctate al <br />
              <span className="text-white drop-shadow-xs">ritmo de la ciudad</span>
            </h2>

            <p className="text-slate-950/85 text-sm sm:text-base font-medium leading-relaxed max-w-lg">
              Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la mágica Cartagena de Indias. Tu próxima gran experiencia comienza aquí.
            </p>

            <div className="pt-2">
              <Link
                to="/buscar"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              >
                <span>Ver catálogo</span>
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
          hacia el Footer, con ondas de 50px de repetición como en la Imagen 2.
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



