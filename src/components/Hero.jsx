import { useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';
import { Sparkles } from 'lucide-react';
import AppLogo from './common/AppLogo.jsx';
import HoneycombCanvas from './home/HoneycombCanvas.jsx';
import BeeParticles from './home/BeeParticles.jsx';
import CartagenaHiveSkyline from './home/CartagenaHiveSkyline.jsx';
import cartagenaHero from '../assets/cartagena-hero.jpg';

export default function Hero() {
  const heroRef = useRef(null);
  const mousePos = useRef({ x: -9999, y: -9999 });

  const heroBackground =
    cartagenaHero ||
    'https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=2000&q=85';

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
      className="relative px-6 sm:px-10 pt-12 sm:pt-16 pb-16 sm:pb-20 text-white bg-[#0D1527] overflow-hidden"
    >
      {/* 1. Malla Hexagonal Interactiva de Fondo (#0B1B3D con bordes ámbar y glowing honeycomb al hover) */}
      <HoneycombCanvas mousePos={mousePos} />

      {/* 2. Partículas de Abejas Minimalistas con Estela Dorada de Miel (Honey Trail) e Interacción con Cursor */}
      <BeeParticles mousePos={mousePos} />

      {/* 3. Capa Fotográfica de Cartagena Colonial fusionada con mix-blend-mode y opacidad sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000 mix-blend-overlay opacity-25"
        style={{ backgroundImage: `url('${heroBackground}')` }}
      />

      {/* Gradientes ambientales nocturnos para contraste elegante de evento */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-[#080E1D]/80 via-transparent to-[#0D1527] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* 4. Siluetas Arquitectónicas de Cartagena: Torre del Reloj + Murallas fusionadas con la geometría de la colmena */}
      <CartagenaHiveSkyline className="z-5 opacity-90" />

      {/* Marca de agua EventHive */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none opacity-[0.06] select-none"
      >
        <AppLogo showName={false} className="h-full w-full" />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start text-left">
        {/* Ubicación y Badge Temático Colmena */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          

          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300">
            <FiMapPin className="text-amber-400" size={15} />
            <span>Cartagena de Indias, Colombia</span>
          </div>
        </div>

        <h1 className="max-w-3xl font-display text-[34px] sm:text-[50px] lg:text-[56px] font-black leading-[1.08] tracking-tight text-white drop-shadow-lg">
          La Colmena Cultural de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300">
            Cartagena
          </span>
          <br />
          Tus Planes Favoritos en un Solo Lugar
        </h1>

        <p className="mt-3.5 max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
          Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la ciudad amurallada.
          Siente el pulso vibrante de la colmena caribeña.
        </p>
      </div>

      {/* Separador geométrico orgánico de panal en la base del Hero */}
      <div className="absolute left-0 right-0 bottom-0 z-10 pointer-events-none select-none">
        <svg
          viewBox="0 0 1200 24"
          preserveAspectRatio="none"
          className="w-full h-4 sm:h-5 text-amber-400 fill-current opacity-70 drop-shadow-[0_-2px_6px_rgba(245,158,11,0.5)]"
        >
          {/* Dientes / celdas de panal triangulares/hexagonales continuas */}
          <path d="M0,24 L0,12 L20,0 L40,12 L60,0 L80,12 L100,0 L120,12 L140,0 L160,12 L180,0 L200,12 L220,0 L240,12 L260,0 L280,12 L300,0 L320,12 L340,0 L360,12 L380,0 L400,12 L420,0 L440,12 L460,0 L480,12 L500,0 L520,12 L540,0 L560,12 L580,0 L600,12 L620,0 L640,12 L660,0 L680,12 L700,0 L720,12 L740,0 L760,12 L780,0 L800,12 L820,0 L840,12 L860,0 L880,12 L900,0 L920,12 L940,0 L960,12 L980,0 L1000,12 L1020,0 L1040,12 L1060,0 L1080,12 L1100,0 L1120,12 L1140,0 L1160,12 L1180,0 L1200,12 L1200,24 Z" />
        </svg>
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.6)]" />
      </div>
    </section>
  );
}
