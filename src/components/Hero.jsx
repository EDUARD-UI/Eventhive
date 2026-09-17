import SearchCard from './SearchCard.jsx';
import EventHiveLogo from './common/EventHiveLogo.jsx';

export default function Hero() {
  return (
    <section className="relative px-6 sm:px-10 pt-16 sm:pt-24 pb-28 sm:pb-36 text-white overflow-hidden bg-[radial-gradient(120%_140%_at_15%_-10%,#2b9dff_0%,#007BFF_45%,#0047a8_100%)]">
      {/* Capa Fotográfica: Murallas de Cartagena con fusión CSS avanzada (mix-blend-mode: overlay) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1583531352515-8884af319dc1?auto=format&fit=crop&w=2000&q=85')`,
          mixBlendMode: 'overlay',
          opacity: 0.38,
        }}
      />

      {/* Gradientes superpuestos para fusionar con el fondo azul y garantizar contraste y legibilidad óptimos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0047a8]/85 via-[#007BFF]/35 to-transparent pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0047a8]/50 via-transparent to-transparent pointer-events-none"
      />

      {/* Marca de agua vectorial del emblema oficial EventHive en el costado derecho */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none opacity-[0.09] select-none"
      >
        <EventHiveLogo variant="icon" size={400} />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 mx-auto flex max-w-[1500px] flex-col items-start text-left">
        <div className="mb-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffc107]/15 border border-[#ffc107]/30 backdrop-blur-md text-[11px] font-bold uppercase tracking-wide text-[#ffc107]">
          <span className="h-2 w-2 rounded-full bg-[#ffc107] animate-pulse" />
          En vivo ahora — 12 eventos esta semana
        </div>

        <h1 className="max-w-[900px] font-display text-[42px] font-bold leading-[1.05] sm:text-[60px] drop-shadow-sm">
          Vive la Magia de Cartagena :
          <br />
          Tus Eventos Favoritos te
          <br />
          Esperan
        </h1>

        <p className="mb-8 mt-4 max-w-3xl text-sm text-sky-100 sm:text-base leading-relaxed font-medium">
          Descubre música, cultura, gastronomía y deporte en la ciudad amurallada — y más allá.
        </p>

        <div className="w-full max-w-[920px] self-center drop-shadow-xl">
          <SearchCard />
        </div>
      </div>

      {/* Curva SVG inferior para transición limpia al contenido blanco/gris */}
      <div className="absolute left-0 right-0 -bottom-0.5 leading-[0] z-10">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="w-full h-[70px] block">
          <path
            d="M0,40 C240,80 480,0 720,30 C960,60 1200,10 1440,40 L1440,70 L0,70 Z"
            fill="#f5f7fa"
          />
        </svg>
      </div>
    </section>
  );
}
