import { useRef } from 'react';
import { FiMapPin } from 'react-icons/fi';
import AppLogo from './common/AppLogo.jsx';
import HoneycombCanvas from './home/HoneycombCanvas.jsx';
import BeeParticles from './home/BeeParticles.jsx';
import CartagenaHiveSkyline from './home/CartagenaHiveSkyline.jsx';
import SearchCard from './SearchCard.jsx';
import Navbar from './usersComponets/Navbar.jsx';
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
      className="relative text-white bg-[#0D1527] overflow-visible select-none"
    >
      {/* Contenedor aislado de efectos y partículas para evitar overflow horizontal */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 1. Malla Hexagonal Interactiva de Fondo (#0B1B3D con bordes ámbar y glowing honeycomb al hover) */}
        <HoneycombCanvas mousePos={mousePos} />

        {/* 2. Partículas de Abejas Minimalistas con Estela Dorada de Miel (Honey Trail) e Interacción con Cursor */}
        <BeeParticles mousePos={mousePos} />

        {/* 3. Capa Fotográfica de Cartagena Colonial fusionada con mix-blend-mode y opacidad sutil */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 mix-blend-overlay opacity-25"
          style={{ backgroundImage: `url('${heroBackground}')` }}
        />

        {/* Gradientes ambientales nocturnos para contraste elegante de evento */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080E1D]/80 via-transparent to-[#0D1527]" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />

        {/* 4. Siluetas Arquitectónicas de Cartagena: Torre del Reloj + Murallas fusionadas con la geometría */}
        <CartagenaHiveSkyline className="z-5 opacity-90" />

        {/* Marca de agua EventHive */}
        <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-[340px] h-[340px] opacity-[0.06] select-none">
          <AppLogo showName={false} className="h-full w-full" />
        </div>
      </div>

      {/* Header de Navegación Integrado Dentro del Hero (Estilo Seamless / Sin Divisiones) */}
      <div className="relative z-30 w-full pointer-events-auto border-b border-amber-400/10">
        <Navbar embedded={true} variant="dark" />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start text-left px-4 sm:px-6 md:px-8 pt-8 sm:pt-12 md:pt-14 pb-16 sm:pb-20">
        {/* Ubicación y Badge Temático  */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-300">
            <FiMapPin className="text-amber-400" size={15} />
            <span>Cartagena de Indias, Colombia</span>
          </div>
        </div>

        <h1 className="max-w-3xl font-display text-[34px] sm:text-[50px] lg:text-[56px] font-black leading-[1.08] tracking-tight text-white drop-shadow-lg">
          Vive la magia de{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300">
            Cartagena
          </span>
          <br />
          Tus Eventos Favoritos en un Solo Lugar
        </h1>

        <p className="mt-3.5 max-w-xl text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
          Descubre festivales, conciertos, arte, gastronomía y vida nocturna en la ciudad amurallada.
        </p>
      </div>

      {/* 5. Buscador Sobresaliendo Semi-Fuera sobre el límite inferior del Hero */}
      <div className="relative z-20 max-w-2xl sm:max-w-[760px] mx-auto px-4 -mb-14 sm:-mb-18">
        <SearchCard />
      </div>

      {/* Línea dorada en la base del Hero */}
      <div className="relative left-0 right-0 bottom-0 z-10 pointer-events-none select-none w-full">
        <div className="h-[5px] w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
      </div>
    </section>
  );
}
