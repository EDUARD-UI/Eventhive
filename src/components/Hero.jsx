import { MapPin, Sparkles, Compass } from 'lucide-react';
import SearchCard from './SearchCard.jsx';
import AppLogo from './common/AppLogo.jsx';
import heroBackground from '../assets/image.png';

export default function Hero() {
  return (
    <section className="relative px-5 sm:px-10 pt-12 sm:pt-16 pb-20 sm:pb-24 text-white overflow-visible bg-gradient-to-br from-[#061224] via-[#091b38] to-[#030914]">
      {/* 1. Capa Fotográfica: Cartagena con mezcla atmosférica de alto contraste */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${heroBackground}')`,
          mixBlendMode: 'luminosity',
          opacity: 0.22,
        }}
      />

      {/* 2. Gradientes Radial & Angular de Profundidad (Azul Noche profundo, destellos Navy y destellos dorados) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(8,127,234,0.32),rgba(11,25,44,0.95)_75%)] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#061224] via-[#091b38]/85 to-[#061224]/70 pointer-events-none"
      />

      {/* 3. Destellos Ámbar/Dorado sutiles del Panal (Glow effects) */}
      <div
        aria-hidden="true"
        className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-[#FFC107]/12 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-[#007BFF]/18 blur-3xl pointer-events-none"
      />

      {/* 4. Patrón Geométrico de Panal de Abejas (Honeycomb SVG Grid) */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="hive-pattern"
            width="56"
            height="96.99"
            patternUnits="userSpaceOnUse"
            patternTransform="scale(1)"
          >
            <path
              d="M28 0 L56 16.165 L56 48.497 L28 64.662 L0 48.497 L0 16.165 Z M28 96.99 L56 80.825 L56 48.493 L28 64.658 L0 48.493 L0 80.825 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hive-pattern)" />
      </svg>

      {/* 5. Ícono del Logo en Grande con Presencia Notoria y Resplandor (Watermark Hero Hive) */}
      <div
        aria-hidden="true"
        className="hidden md:block absolute -right-6 sm:right-4 lg:right-12 top-1/2 -translate-y-1/2 w-[340px] sm:w-[420px] lg:w-[480px] h-[340px] sm:h-[420px] lg:h-[480px] pointer-events-none select-none z-[5]"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Halo de resplandor dorado / azul detrás del ícono */}
          <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-[#007BFF]/25 to-[#FFC107]/20 blur-3xl" />
          <div className="opacity-[0.18] drop-shadow-[0_0_40px_rgba(255,193,7,0.3)] transform rotate-[-8deg] hover:rotate-0 transition-transform duration-700">
            <AppLogo showName={false} className="w-full h-full max-h-[380px]" />
          </div>
        </div>
      </div>

      {/* 6. Contenido Principal */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start text-left mb-8 sm:mb-12">
        {/* Badge Cartagena con estilo Glassmorphic y acento dorado */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] border border-white/10 backdrop-blur-md text-xs font-medium text-slate-200 shadow-sm mb-4">
          <MapPin className="text-[#FFC107] shrink-0" size={14} />
          <span>Cartagena de Indias, Colombia</span>
        </div>

        {/* Título de Impacto visual */}
        <h1 className="max-w-3xl text-3xl sm:text-5xl lg:text-[54px] font-black leading-[1.12] tracking-tight drop-shadow-md text-white">
          Vive la magia de Cartagena:
          <span className="block mt-1 bg-gradient-to-r from-white via-sky-100 to-[#FFC107] bg-clip-text text-transparent">
            Tus eventos favoritos te esperan
          </span>
        </h1>

        <p className="mt-3.5 max-w-2xl text-sm sm:text-base text-slate-300/90 leading-relaxed font-normal">
          Conéctate al epicentro cultural y de entretenimiento del Caribe. Descubre conciertos, festivales, gastronomía y arte en la ciudad amurallada.
        </p>

        {/* Mini stats / tags rápidos */}
        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <Compass size={13} className="text-[#007BFF]" />
            <span>Eventos verificados</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <span className="text-[#FFC107] font-bold">★</span>
            <span>Experiencias exclusivas</span>
          </div>
        </div>
      </div>

      {/* 7. Buscador de Eventos (Glassmorphic Premium) que sobresale hacia la siguiente sección */}
      <div className="relative z-20 max-w-3xl sm:max-w-[760px] mx-auto -mb-28 sm:-mb-32 px-3 sm:px-4">
        <SearchCard />
      </div>

      {/* 8. Línea divisoria elegante con destello ámbar y azul */}
      <div className="absolute left-0 right-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC107] to-transparent z-10 pointer-events-none opacity-80" />
    </section>
  );
}
