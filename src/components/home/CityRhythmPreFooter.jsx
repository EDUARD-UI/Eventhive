import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import fuerteImg from '../../assets/fuerte.jpg';
import torreRelojImg from '../../assets/torre-reloj.png';

/**
 * CityRhythmPreFooter
 * Complemento superior del Footer inspirado en el diseño de referencia:
 * - Dos cartas inclinadas coleccionables (Fuerte de San Fernando y Torre del Reloj) en lugar de los sobres.
 * - Título en display: "CONÉCTATE AL RITMO DE LA CIUDAD".
 * - Botón destacado debajo del título (sin imagen de la persona).
 * - Sin gradientes y sin emojis.
 */
export default function CityRhythmPreFooter() {
  return (
    <section className="w-full bg-[#182C58] dark:bg-white text-white dark:text-slate-900 py-8 sm:py-10 lg:py-12 px-6 sm:px-10 lg:px-16 border-t border-slate-700/60 dark:border-slate-200 relative overflow-visible select-none mt-14 sm:mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* Columna Izquierda/Centro: Cartas que sobresalen arriba de la sección */}
        <div className="lg:col-span-6 flex items-center justify-center relative -mt-16 sm:-mt-20 md:-mt-24 z-20">
          
          {/* Carta 1: Fuerte de San Fernando (Inclinada a la izquierda, sobresaliendo arriba) */}
          <div className="relative w-40 sm:w-48 md:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 dark:border-slate-300 bg-slate-900 shadow-2xl transform -rotate-8 -translate-x-4 sm:-translate-x-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-1 cursor-pointer">
            <img
              src={fuerteImg}
              alt="Fuerte de San Fernando, Cartagena"
              className="w-full h-full object-cover object-center"
            />
            {/* Etiqueta inferior de la carta */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs p-2.5 text-center border-t border-white/10">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 block truncate">
                Fuerte de San Fernando
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block mt-0.5">
                Cartagena de Indias
              </span>
            </div>
          </div>

          {/* Carta 2: Torre del Reloj (Inclinada a la derecha, superpuesta y sobresaliendo) */}
          <div className="relative w-40 sm:w-48 md:w-52 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-400/70 bg-slate-900 shadow-2xl transform rotate-6 translate-x-4 sm:translate-x-6 hover:rotate-0 hover:scale-105 transition-all duration-300 z-10 cursor-pointer">
            <img
              src={torreRelojImg}
              alt="Torre del Reloj, Cartagena"
              className="w-full h-full object-cover object-[center_25%]"
            />
            {/* Etiqueta inferior de la carta */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs p-2.5 text-center border-t border-amber-400/30">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 block truncate">
                Torre del Reloj
              </span>
              <span className="text-[9px] text-slate-300 font-semibold block mt-0.5">
                Centro Histórico
              </span>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Título, descripción y botón */}
        <div className="lg:col-span-6 flex flex-col items-start text-left space-y-4 lg:pl-6 relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-100 border border-amber-400/30 dark:border-amber-300 text-amber-400 dark:text-amber-800 text-[11px] font-black uppercase tracking-widest">
            Experiencia EventHive
          </span>

          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white dark:text-slate-950 uppercase leading-snug max-w-lg">
            Conéctate al <br />
            <span className="text-amber-400 dark:text-amber-600">ritmo de la ciudad</span>
          </h2>

          <p className="text-slate-200 dark:text-slate-600 text-xs sm:text-sm font-normal leading-relaxed max-w-lg">
            Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la mágica Cartagena de Indias. Tu próxima gran experiencia comienza aquí.
          </p>

          <div className="pt-1">
            <Link
              to="/buscar"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Ver catálogo</span>
              <FiArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
