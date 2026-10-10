import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMapPin } from 'react-icons/fi';
import BeeParticles from './home/BeeParticles.jsx';
import CartagenaHiveSkyline from './home/CartagenaHiveSkyline.jsx';
import colombiaImg from '../assets/Colombia.jpg';
import { useTheme } from '../context/ThemeContext.jsx';

/**
 * 4-point sparkle star matching the reference design (vector limpio, sin emojis)
 */
function SparkleStar({ className = 'w-5 h-5 text-amber-400' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
    </svg>
  );
}

export default function Hero() {
  const { isDark } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  // Transición suave de scroll estilo Apple / Antigravity
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Progreso de desplazamiento normalizado de 0 a 1 en los primeros 600px
  const scrollProgress = Math.min(1, Math.max(0, scrollY / 650));
  const scale = 1 - scrollProgress * 0.05;
  const opacity = 1 - scrollProgress * 0.35;
  const translateY = scrollProgress * 28;

  return (
    <section
      id="hero"
      className={`relative overflow-visible select-none min-h-[580px] lg:min-h-[660px] flex items-center transition-colors duration-300 ${
        isDark
          ? 'bg-[#0B132B] text-white'
          : 'bg-slate-100 text-slate-900 border-b border-slate-200/80'
      }`}
    >
      {/* Contenedor aislado de efectos y partículas (abejas vuelan a placer) */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <BeeParticles />
        <CartagenaHiveSkyline className={`z-5 opacity-30 ${isDark ? 'text-slate-900' : 'text-slate-300'}`} />
      </div>

      {/* Contenido Principal con Transición de Scroll estilo Apple / Antigravity */}
      <div
        style={{
          transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
          opacity,
          willChange: 'transform, opacity',
        }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20 transition-all duration-75"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Columna Izquierda: Textos y Botón Ver Catálogo */}
          <div className="lg:col-span-5 flex flex-col items-start text-left relative z-20">
            {/* Destello decorativo superior */}
            <div className="mb-2 pl-1 animate-pulse">
              <SparkleStar className="w-5 h-5 text-amber-500" />
            </div>

            {/* Ubicación y Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5 border ${
                isDark
                  ? 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700 shadow-2xs'
              }`}
            >
              <FiMapPin className="text-amber-500" size={14} />
              <span>Cartagena de Indias, Colombia</span>
            </div>

            {/* Título Principal en color sólido */}
            <h1
              className={`font-display font-black text-4xl sm:text-5xl md:text-6xl xl:text-[66px] leading-[1.06] tracking-tight mb-5 drop-shadow-xs ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Conéctate al <br />
              <span className="text-amber-500">ritmo de la ciudad</span>
            </h1>

            {/* Subtítulo descriptivo */}
            <p
              className={`max-w-lg text-sm sm:text-base leading-relaxed font-normal mb-8 ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la mágica Cartagena de Indias. Vive cada momento al máximo.
            </p>

            {/* Botón Ver Catálogo con color sólido */}
            <div className="relative flex items-center">
              <Link
                to="/buscar"
                className="group relative inline-flex items-center gap-4 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>Ver catálogo</span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform duration-200">
                  <FiArrowRight size={15} strokeWidth={2.8} />
                </span>
              </Link>

              {/* Destello decorativo inferior derecho */}
              <div className="absolute -bottom-6 left-52 sm:left-64 pointer-events-none">
                <SparkleStar className="w-4 h-4 text-amber-500/80" />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Imagen completa Colombia.jpg posicionada más hacia la derecha */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end relative h-full lg:translate-x-6 xl:translate-x-12">
            <div className="relative w-full max-w-[680px] h-full group">
              <div
                className={`relative w-full h-[460px] sm:h-[530px] md:h-[590px] lg:h-[630px] overflow-hidden rounded-[2.5rem] shadow-2xl border transition-all duration-500 ${
                  isDark
                    ? 'border-slate-800 bg-[#0A1325]'
                    : 'border-slate-200/90 bg-white'
                }`}
              >
                <img
                  src={colombiaImg}
                  alt="Cartagena de Indias, Colombia"
                  className="w-full h-full object-cover object-center scale-100 group-hover:scale-103 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
