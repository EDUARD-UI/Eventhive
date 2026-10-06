import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

export default function HomeBannersSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getHomeBanners()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else {
          setBanners([]);
        }
      })
      .catch(() => {
        if (isMounted) setBanners([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || !banners || banners.length === 0) {
    return null;
  }

  // Ordenar y asignar posición 1 (izq) y posición 2 (der)
  const bannerLeft = banners.find((b) => b.posicion === 1) || banners[0];
  const bannerRight = banners.find((b) => b.posicion === 2) || (banners.length > 1 ? banners[1] : null);

  const renderBannerCard = (banner, isOffsetUp = false) => {
    if (!banner) return null;

    const isExternal = banner.enlaceUrl?.startsWith('http');

    return (
      <div
        className={`group relative overflow-hidden rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 ${
          isOffsetUp ? 'lg:translate-y-4' : 'lg:-translate-y-2'
        }`}
      >
        {/* Contenedor con ratio rectangular armónico */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] w-full overflow-hidden bg-slate-900">
          {banner.imagenUrl ? (
            <ImageWithFallback
              src={banner.imagenUrl}
              alt={banner.titulo}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
              fallbackText={banner.titulo}
              iconSize={36}
            />
          ) : (
            /* Imagen de sombra neutral sin gradiente si no hay imagen cargada */
            <div className="w-full h-full bg-[#0D1527] relative" />
          )}

          {/* Sombreado de alto contraste para máxima legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent pointer-events-none" />

          {/* Contenido textual y botón */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 z-10">
            <h3 className="font-extrabold text-white text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight uppercase mb-4 max-w-lg drop-shadow-md">
              {banner.titulo}
            </h3>

            {banner.textoBoton && banner.enlaceUrl && (
              <div>
                {isExternal ? (
                  <a
                    href={banner.enlaceUrl}
                    target="_self"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 group/btn cursor-pointer"
                  >
                    <span>{banner.textoBoton}</span>
                    <FiArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover/btn:translate-x-1"
                    />
                  </a>
                ) : (
                  <Link
                    to={banner.enlaceUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md active:scale-95 group/btn cursor-pointer"
                  >
                    <span>{banner.textoBoton}</span>
                    <FiArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover/btn:translate-x-1"
                    />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="w-full py-14 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1850px] mx-auto">
      <div className={`grid grid-cols-1 ${bannerRight ? 'lg:grid-cols-2' : ''} gap-8 lg:gap-10 items-center`}>
        {renderBannerCard(bannerLeft, false)}
        {bannerRight && renderBannerCard(bannerRight, true)}
      </div>
    </section>
  );
}