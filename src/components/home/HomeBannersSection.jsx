import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowRight } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * BannerCard
 * Tarjeta de banner limpia, sobria y estática (sin animaciones de tilt ni saltos por scroll).
 * Incluye el botón oficial de acción sin tags adicionales.
 */
function BannerCard({ banner }) {
  if (!banner) return null;

  let targetUrl = banner.enlaceUrl || '';
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
    <div className="group relative w-full overflow-hidden rounded-[26px] border border-slate-200/90 dark:border-white/10 bg-slate-950 shadow-md hover:shadow-xl hover:border-amber-400/60 transition-all duration-300">
      <CardWrapper
        {...wrapperProps}
        className="block relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[230px] sm:min-h-[270px] overflow-hidden bg-slate-950 cursor-pointer"
      >
        {/* Imagen de fondo del banner */}
        {banner.imagenUrl ? (
          <ImageWithFallback
            src={banner.imagenUrl}
            alt={banner.titulo || 'Banner'}
            className="w-full h-full"
            imgClassName="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0B132B] to-[#1C2541]" />
        )}

        {/* Degradado suave para garantizar legibilidad de textos */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

        {/* Contenido textual y Botón de acción */}
        <div className="absolute inset-0 p-5 sm:p-7 lg:p-8 flex flex-col justify-end z-10 pointer-events-none">
          {banner.titulo && (
            <h3 className="font-extrabold text-white group-hover:text-amber-100 text-lg sm:text-xl lg:text-2xl xl:text-3xl leading-snug tracking-tight uppercase mb-2 sm:mb-2.5 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-colors duration-200">
              {banner.titulo}
            </h3>
          )}

          {banner.descripcion && (
            <p className="text-xs sm:text-sm text-slate-200/90 font-medium line-clamp-2 max-w-xl mb-4 drop-shadow-sm">
              {banner.descripcion}
            </p>
          )}

          {/* Botón de acción oficial del banner (sin tag de destacado) */}
          {banner.textoBoton && (
            <div>
              <span
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer pointer-events-auto"
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
}

export default function HomeBannersSection() {
  // Consulta de banners con TanStack Query (Stale-While-Revalidate)
  const { data: banners = [], isLoading: loading } = useQuery({
    queryKey: ['home-banners'],
    queryFn: getHomeBanners,
    staleTime: 1000 * 60 * 5,
  });

  if (loading) {
    return (
      <section className="w-full py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9 items-start">
          <div className="w-full rounded-[26px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse aspect-[16/10] sm:aspect-[16/9] min-h-[230px] p-6 flex flex-col justify-end">
            <div className="w-3/4 h-8 bg-slate-300 dark:bg-slate-800 rounded-xl mb-3" />
            <div className="w-36 h-10 bg-amber-400/30 dark:bg-amber-500/20 rounded-xl" />
          </div>
          <div className="w-full rounded-[26px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse aspect-[16/10] sm:aspect-[16/9] min-h-[230px] p-6 flex flex-col justify-end">
            <div className="w-2/3 h-8 bg-slate-300 dark:bg-slate-800 rounded-xl mb-3" />
            <div className="w-36 h-10 bg-amber-400/30 dark:bg-amber-500/20 rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const bannerLeft = banners.find((b) => Number(b.posicion) === 1) || banners[0];
  const bannerRight =
    banners.find((b) => Number(b.posicion) === 2 && b !== bannerLeft) ||
    (banners.length > 1 && banners[1] !== bannerLeft ? banners[1] : null);

  return (
    <section className="relative w-full py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-10 max-w-[1600px] mx-auto overflow-visible">
      {/* Orbes sutiles de fondo estáticos */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 dark:bg-amber-400/8 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 right-1/4 w-72 h-72 rounded-full bg-emerald-500/8 dark:bg-emerald-400/8 blur-3xl"
      />

      <div
        className={`grid grid-cols-1 ${
          bannerRight ? 'lg:grid-cols-2' : ''
        } gap-7 sm:gap-9 items-center relative z-10`}
      >
        <BannerCard banner={bannerLeft} />
        {bannerRight && <BannerCard banner={bannerRight} />}
      </div>
    </section>
  );
}
