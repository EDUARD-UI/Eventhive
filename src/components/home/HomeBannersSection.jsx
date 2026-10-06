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

  const renderBannerCard = (banner, colSpanClass = 'lg:col-span-6') => {
    if (!banner) return null;

    let targetUrl = banner.enlaceUrl || '';
    // Respaldo de seguridad en caso de que enlaceUrl siga apuntando a un archivo de imagen:
    if (/\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(targetUrl) || !targetUrl || targetUrl === '#') {
      if (/coachella/i.test(banner.titulo || '')) {
        targetUrl = '/eventos/coachella';
      } else if (/classic/i.test(banner.titulo || '')) {
        targetUrl = '/eventos/22';
      } else {
        targetUrl = '/buscar';
      }
    }

    const eventMatch = targetUrl.match(/\/eventos?\/(\d+)/i);
    if (eventMatch) {
      targetUrl = `/eventos/${eventMatch[1]}`;
    }

    const isExternal = targetUrl.startsWith('http');
    const CardWrapper = isExternal ? 'a' : Link;
    const wrapperProps = isExternal
      ? { href: targetUrl, target: '_blank', rel: 'noopener noreferrer' }
      : { to: targetUrl };

    return (
      <div
        className={`group relative overflow-hidden rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 w-full ${colSpanClass}`}
      >
        <CardWrapper
          {...wrapperProps}
          className="block relative w-full h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden bg-slate-900 cursor-pointer"
        >
          {banner.imagenUrl ? (
            <ImageWithFallback
              src={banner.imagenUrl}
              alt={banner.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              fallbackText={banner.titulo}
              iconSize={36}
            />
          ) : (
            /* Imagen de sombra neutral sin gradiente si no hay imagen cargada */
            <div className="w-full h-full bg-[#0D1527] relative" />
          )}

          {/* Sombreado de alto contraste para máxima legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-slate-950/10 pointer-events-none" />

          {/* Contenido textual y botón */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 z-10">
            <h3 className="font-extrabold text-white text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight uppercase mb-4 max-w-lg drop-shadow-md">
              {banner.titulo}
            </h3>

            {banner.textoBoton && (
              <div>
                <span
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md group-hover:shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <span>{banner.textoBoton}</span>
                  <FiArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </span>
              </div>
            )}
          </div>
        </CardWrapper>
      </div>
    );
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1850px] mx-auto">
      <div className={`grid grid-cols-1 ${bannerRight ? 'lg:grid-cols-12' : ''} gap-6 sm:gap-8 lg:gap-8 items-stretch`}>
        {renderBannerCard(bannerLeft, bannerRight ? 'lg:col-span-7' : 'lg:col-span-12')}
        {bannerRight && renderBannerCard(bannerRight, 'lg:col-span-5')}
      </div>
    </section>
  );
}