import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import Navbar from './usersComponets/Navbar.jsx';
import SearchCard from './SearchCard.jsx';
import BeeParticles from './home/BeeParticles.jsx';

/**
 * Hero Principal de EventHive
 * - Header de Navegación integrado limpiamente en la parte superior sin divisiones ni barras cortadas.
 * - 100% Full-Width, plano y blanco puro (#ffffff), sin bordes perimetrales ni fondos oscuros.
 * - Malla de hexágonos y detalles dorados que inician sutiles y se "encienden" luminosos al hover.
 * - 5 abejas realistas animadas con estela de miel.
 * - Textos originales de image_0.png y botones [EXPLORAR AHORA] y [Ver Cartelera].
 * - Buscador sobresaliendo semi-fuera sobre el separador dentado inferior de panal.
 */
export default function Hero() {
  const heroRef = useRef(null);
  const mousePos = useRef({ x: -9999, y: -9999 });


  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mousePos.current = { x: -9999, y: -9999 };
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group/hero relative w-full bg-[#ffffff] overflow-visible select-none transition-colors duration-500"
    >
      {/* 1. Malla Hexagonal de Panal interactiva: sutil al inicio, encendida luminosa al hover */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-10 group-hover/hero:opacity-85 transition-opacity duration-700 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="hero-honeycomb-pattern"
              width="64"
              height="110.85"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M32 0 L64 18.475 L64 55.425 L32 73.9 L0 55.425 L0 18.475 Z M32 110.85 L64 92.375 L64 55.425 L32 73.9 L0 55.425 L0 92.375 Z"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="0.8"
                strokeOpacity="0.4"
                className="group-hover/hero:stroke-opacity-95 transition-all duration-700"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-honeycomb-pattern)" />
        </svg>

        {/* Destellos dorados suaves que se intensifican al pasar el cursor */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-400/5 group-hover/hero:bg-amber-400/20 rounded-full blur-3xl transition-all duration-700 pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-[32rem] h-[32rem] bg-amber-300/5 group-hover/hero:bg-amber-300/20 rounded-full blur-3xl transition-all duration-700 pointer-events-none" />
      </div>

      {/* 2. Cinco Abejas Realistas Doradas y Negras con física natural */}
      <BeeParticles mousePos={mousePos} />

      {/* 3. Header de Navegación Integrado Dentro del Hero (Estilo Seamless / Sin Divisiones) */}
      <div className="relative z-30 w-full pointer-events-auto">
        <Navbar embedded={true} />
      </div>

      {/* 4. Contenido Central del Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-14 pb-16 sm:pb-20 flex flex-col items-start text-left">

        {/* Ubicación: pin dorado que se enciende al hover */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 group-hover/hero:text-slate-800 transition-colors">
            <FiMapPin
              className="text-amber-400/60 group-hover/hero:text-amber-500 group-hover/hero:drop-shadow-[0_0_8px_rgba(245,158,11,0.65)] transition-all duration-300"
              size={16}
            />
            <span>Cartagena de Indias, Colombia</span>
          </div>
        </div>

        {/* Título Principal original de image_0.png con encendido dorado al hover */}
        <h1 className="max-w-4xl font-display text-[32px] sm:text-[48px] lg:text-[56px] font-black leading-[1.1] tracking-tight text-slate-900">
          Vive la Magia de{' '}
          <span className="text-amber-500/80 group-hover/hero:text-amber-500 group-hover/hero:drop-shadow-[0_0_14px_rgba(245,158,11,0.45)] transition-all duration-500">
            Cartagena
          </span> :
          <br />
          Tus Eventos Favoritos te Esperan
        </h1>

        {/* Subtítulo Descriptivo original de image_0.png */}
        <p className="mt-4 max-w-2xl text-xs sm:text-base text-slate-600 leading-relaxed font-normal">
          Descubre música, cultura, gastronomía y deporte en la ciudad amurallada — y más allá.
        </p>

        {/* Botones originales de image_0.png: [EXPLORAR AHORA] y [Ver Cartelera] */}
        <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4">
          <Link
            to="/buscar"
            className="inline-flex items-center gap-2 px-7 sm:px-8 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 group cursor-pointer"
          >
            <span>EXPLORAR AHORA</span>
            <FiArrowRight size={15} className="group-hover:translate-x-1 text-slate-950 transition-transform" />
          </Link>

          <a
            href="#proximos"
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 rounded-full border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer"
          >
            Ver Cartelera
          </a>
        </div>
      </div>

      {/* 5. Buscador Sobresaliendo Semi-Fuera sobre el límite inferior del Hero */}
      <div className="relative z-20 max-w-2xl sm:max-w-[760px] mx-auto px-4 -mb-14 sm:-mb-18">
        <SearchCard />
      </div>

      {/* 6. Patrón Amarillo ambar de colmena de la imagen image_1.png */}
      <div className="relative left-0 right-0 bottom-0 z-10 pointer-events-none select-none w-full">
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.6)]" />
      </div>
    </section>
  );
}
