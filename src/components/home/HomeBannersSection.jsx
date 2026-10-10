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

  if (loading) {
    return (
      <section className="w-full py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-10 max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-8 items-start">
          {/* Skeleton Banner Izquierdo */}
          <div className="w-full lg:-translate-y-2 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse h-[320px] sm:h-[390px] lg:h-[450px] relative p-6 sm:p-8 lg:p-10 flex flex-col justify-end">
            <div className="w-3/4 h-8 sm:h-10 bg-slate-300 dark:bg-slate-800 rounded-xl mb-4" />
            <div className="w-1/2 h-5 sm:h-6 bg-slate-200 dark:bg-slate-800/70 rounded-lg mb-6" />
            <div className="w-36 h-10 bg-amber-400/30 dark:bg-amber-500/20 rounded-xl" />
          </div>

          {/* Skeleton Banner Derecho */}
          <div className="w-full lg:translate-y-6 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse h-[320px] sm:h-[390px] lg:h-[450px] relative p-6 sm:p-8 lg:p-10 flex flex-col justify-end">
            <div className="w-2/3 h-8 sm:h-10 bg-slate-300 dark:bg-slate-800 rounded-xl mb-4" />
            <div className="w-2/5 h-5 sm:h-6 bg-slate-200 dark:bg-slate-800/70 rounded-lg mb-6" />
            <div className="w-36 h-10 bg-amber-400/30 dark:bg-amber-500/20 rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
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
        className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-400/60 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 ease-out w-full ${colSpanClass}`}
      >
        <CardWrapper
          {...wrapperProps}
          className="block relative w-full h-[320px] sm:h-[390px] lg:h-[450px] overflow-hidden bg-slate-900 cursor-pointer"
        >
          {banner.imagenUrl ? (
            <ImageWithFallback
              src={banner.imagenUrl}
              alt={banner.titulo}
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              fallbackText={banner.titulo}
              iconSize={36}
            />
          ) : (
            /* Imagen de sombra neutral sin gradiente si no hay imagen cargada */
            <div className="w-full h-full bg-[#0D1527] relative" />
          )}

          {/* Sin oscurecer la imagen del banner para que se vea nítida en modo oscuro */}
          
          {/* Contenido textual y botón con sombra de texto de alta legibilidad sin gradiente */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 lg:p-10 z-10 pointer-events-none">
            <h3 className="font-extrabold text-white group-hover:text-amber-100 text-xl sm:text-2xl lg:text-3xl leading-snug tracking-tight uppercase mb-4 max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] transition-colors duration-300">
              {banner.titulo}
            </h3>

            {banner.textoBoton && (
              <div>
                <span
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 group-hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-amber-500/30 group-hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <span>{banner.textoBoton}</span>
                  <FiArrowRight
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
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
    <section className="w-full py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-10 max-w-none">
      <div className={`grid grid-cols-1 ${bannerRight ? 'lg:grid-cols-2' : ''} gap-6 sm:gap-8 lg:gap-8 items-start`}>
        {renderBannerCard(bannerLeft, 'w-full lg:-translate-y-2')}
        {bannerRight && renderBannerCard(bannerRight, 'w-full lg:translate-y-6 sm:mt-0')}
      </div>
    </section>
  );
}