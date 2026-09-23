import { FiMapPin } from 'react-icons/fi';
import SearchCard from './SearchCard.jsx';
import AppLogo from './common/AppLogo.jsx';
import heroBackground from '../assets/image.png';

export default function Hero() {
  return (
    <section className="relative px-6 sm:px-10 pt-10 sm:pt-14 pb-16 sm:pb-20 text-white bg-[radial-gradient(120%_140%_at_15%_-10%,#2b9dff_0%,#007BFF_45%,#0047a8_100%)]">
      {/* Capa Fotográfica: Murallas de Cartagena con fusión CSS avanzada (mix-blend-mode: overlay) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-1000"
        style={{
          backgroundImage: `url('${heroBackground}')`,
          mixBlendMode: 'overlay',
          opacity: 0.38,
        }}
      />

      {/* Gradientes superpuestos para contraste óptimo */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0047a8]/85 via-[#007BFF]/35 to-transparent pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-[#0047a8]/60 via-transparent to-transparent pointer-events-none"
      />

      {/* Marca de agua de EventHive */}
      <div
        aria-hidden="true"
        className="hidden lg:block absolute -right-8 top-1/2 -translate-y-1/2 w-[360px] h-[360px] pointer-events-none opacity-[0.09] select-none"
      >
        <AppLogo showName={false} className="h-full w-full" />
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-start text-left mb-6 sm:mb-8">
        {/* Ubicación y Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/90">
            <FiMapPin className="text-[#ffc107]" size={15} />
            <span>Cartagena de Indias, Colombia</span>
          </div>


        </div>

        <h1 className="max-w-3xl font-display text-[34px] sm:text-[48px] font-extrabold leading-[1.1] drop-shadow-sm">
          Vive la Magia de Cartagena :
          <br />
          Tus Eventos Favoritos te
          <br />
          Esperan
        </h1>

        <p className="mt-2.5 max-w-xl text-xs text-sky-100 sm:text-sm leading-relaxed font-normal">
          Descubre música, cultura, gastronomía y deporte en la ciudad amurallada — y más allá.
        </p>
      </div>

      {/* Buscador de tamaño mediano que sobresale hacia la siguiente sección */}
      <div className="relative z-20 max-w-2xl sm:max-w-[720px] mx-auto -mb-24 sm:-mb-28 px-3 sm:px-4">
        <SearchCard />
      </div>

      {/* Franja horizontal dorada en el borde inferior acorde al logo */}
      <div className="absolute left-0 right-0 bottom-0 h-2 bg-[#ffc107] z-10 pointer-events-none" />
    </section>
  );
}
