import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * FeaturedEventBanner
 * Banner horizontal de ancho completo para el Evento Destacado ('Vive el Classic Night').
 * - Altura fija cómoda (h-72 sm:h-80 lg:h-96)
 * - Imagen con object-cover y efecto zoom al hover
 * - Overlay en degradado para que el texto y el botón queden legibles en la esquina inferior izquierda
 */
export default function FeaturedEventBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getHomeBanners()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const featured = data.find((b) => b.posicion === 1) || data[0];
          setBanner(featured);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Banner por defecto o cargado desde backend
  const activeBanner = banner || {
    titulo: 'VIVE EL CLASSIC NIGHT',
    imagenUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1920&q=80',
    textoBoton: 'VER EVENTO',
    enlaceUrl: '/buscar',
  };

  const isExternal = activeBanner.enlaceUrl?.startsWith('http');

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="group relative w-full h-72 sm:h-80 md:h-88 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-900 transition-all duration-300 hover:shadow-2xl">
        {/* Imagen de fondo panorámica con object-cover */}
        <ImageWithFallback
          src={activeBanner.imagenUrl}
          alt={activeBanner.titulo}
          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
          fallbackText={activeBanner.titulo}
          iconSize={48}
        />

        {/* Overlay en degradado direccional para legibilidad óptima */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />

        {/* Contenido en la esquina inferior izquierda */}
        <div className="absolute inset-0 flex flex-col justify-end items-start p-6 sm:p-10 lg:p-12 z-10 max-w-2xl text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-2.5 backdrop-blur-md shadow-xs">
            <FiStar size={12} className="fill-amber-400" />
            <span>Evento Especial Recomendado</span>
          </div>

          <h3 className="font-display font-black text-white text-2xl sm:text-3xl lg:text-4xl leading-tight tracking-tight uppercase mb-4 drop-shadow-md">
            {activeBanner.titulo}
          </h3>

          <div>
            {isExternal ? (
              <a
                href={activeBanner.enlaceUrl}
                target="_self"
                className="inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-amber-500/25 active:scale-95 group/btn cursor-pointer"
              >
                <span>{activeBanner.textoBoton || 'VER EVENTO'}</span>
                <FiArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
            ) : (
              <Link
                to={activeBanner.enlaceUrl}
                className="inline-flex items-center gap-2.5 px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-amber-500/25 active:scale-95 group/btn cursor-pointer"
              >
                <span>{activeBanner.textoBoton || 'VER EVENTO'}</span>
                <FiArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}