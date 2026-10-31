import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowUpRight } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * InteractiveBannerCard
 * Tarjeta 3D interactiva inspirada en Blendo con:
 * - Inclinación 3D en tiempo real al mover el cursor + parallax interno en la imagen.
 * - Desfase vertical y rotación suave sincronizada al scroll (animación fluida de 450ms).
 * - Botón de acción audaz con micro-interacción.
 */
function InteractiveBannerCard({ banner, index, scrollProgress, isVisible }) {
  const cardRef = useRef(null);
  const [mouse, setMouse] = useState({ rx: 0, ry: 0, imgX: 0, imgY: 0, glowX: 50, glowY: 50, hovered: false });

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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rx = ((y - cy) / cy) * -4.5;
    const ry = ((x - cx) / cx) * 4.5;
    const imgX = ((x - cx) / cx) * -8;
    const imgY = ((y - cy) / cy) * -8;

    setMouse({
      rx,
      ry,
      imgX,
      imgY,
      glowX: (x / rect.width) * 100,
      glowY: (y / rect.height) * 100,
      hovered: true,
    });
  };

  const handleMouseLeave = () => {
    setMouse({ rx: 0, ry: 0, imgX: 0, imgY: 0, glowX: 50, glowY: 50, hovered: false });
  };

  const isLeft = index === 0;
  const active = isVisible || scrollProgress > 0.08;

  // Movimiento contrapuesto al hacer scroll fluido
  const scrollWaveY = active
    ? (scrollProgress - 0.5) * (isLeft ? -16 : 16)
    : isLeft
    ? 35
    : 50;

  const entryRotateZ = isLeft ? -1 : 1;
  const currentRotateZ = active
    ? mouse.hovered
      ? 0
      : (scrollProgress - 0.5) * (isLeft ? 1 : -1)
    : entryRotateZ * 2;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: active ? 1 : 0,
        transform: active
          ? `perspective(1300px) translate3d(0px, ${scrollWaveY.toFixed(1)}px, ${mouse.hovered ? '16px' : '0px'}) rotateX(${mouse.rx.toFixed(2)}deg) rotateY(${mouse.ry.toFixed(2)}deg) rotateZ(${currentRotateZ.toFixed(2)}deg) scale(${mouse.hovered ? 1.02 : 1})`
          : `perspective(1300px) translate3d(${isLeft ? '-30px' : '30px'}, 45px, -40px) rotateX(10deg) rotateY(${isLeft ? '8deg' : '-8deg'}) rotateZ(${isLeft ? '-2deg' : '2deg'}) scale(0.94)`,
        transitionProperty: mouse.hovered ? 'box-shadow' : 'transform, opacity',
        transitionDuration: mouse.hovered ? '120ms' : '450ms',
        transitionDelay: mouse.hovered ? '0ms' : `${index * 60}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform, opacity',
      }}
      className="group relative w-full transform-gpu"
    >
      {/* Marco principal con brillo de seguimiento */}
      <div className="relative overflow-hidden rounded-[28px] border-2 border-slate-900/80 dark:border-white/15 group-hover:border-amber-400 shadow-[0_14px_35px_-10px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.75)] transition-colors duration-300">
        {/* Luz radial interactiva sobre el borde */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(420px circle at ${mouse.glowX}% ${mouse.glowY}%, rgba(245, 158, 11, 0.22), transparent 65%)`,
          }}
        />

        <CardWrapper
          {...wrapperProps}
          className="block relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[240px] sm:min-h-[280px] overflow-hidden bg-slate-950 cursor-pointer"
        >
          {/* Imagen con parallax inverso suave */}
          <div
            className="w-full h-full transition-transform duration-300 ease-out"
            style={{
              transform: `scale(1.07) translate3d(${mouse.imgX.toFixed(1)}px, ${mouse.imgY.toFixed(1)}px, 0)`,
            }}
          >
            {banner.imagenUrl ? (
              <ImageWithFallback
                src={banner.imagenUrl}
                alt={banner.titulo || 'Banner'}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0B132B] to-[#1C2541]" />
            )}
          </div>

          {/* Degradado para garantizar legibilidad de los textos */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Contenido textual superior e inferior */}
          <div className="absolute inset-0 p-5 sm:p-7 md:p-8 flex flex-col justify-between z-10 pointer-events-none">
            {/* Tag o Indicador Superior */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-widest bg-white/95 text-slate-900 border border-white shadow-sm backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {banner.titulo?.includes('Coachella') ? 'Edición Especial' : 'Destacado'}
              </span>

              {/* Botón flotante estilo cápsula interactiva */}
              <div className="w-10 h-10 rounded-full bg-amber-500 group-hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 pointer-events-auto">
                <FiArrowUpRight size={20} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Texto Principal en la parte inferior */}
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-md group-hover:text-amber-300 transition-colors duration-200 line-clamp-2">
                {banner.titulo}
              </h3>

              {banner.descripcion && (
                <p className="text-xs sm:text-sm text-slate-200/90 font-medium line-clamp-2 max-w-xl drop-shadow-sm">
                  {banner.descripcion}
                </p>
              )}
            </div>
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}

export default function HomeBannersSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Consulta de banners con TanStack Query (Stale-While-Revalidate)
  const { data: banners = [], isLoading: loading } = useQuery({
    queryKey: ['home-banners'],
    queryFn: getHomeBanners,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(node);

    let rafId = null;
    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (!sectionRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        if (rect.top <= vh * 0.92) setIsVisible(true);
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
        setScrollProgress(progress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [loading]);

  if (loading) {
    return (
      <section ref={sectionRef} className="w-full py-8 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-9 items-start">
          <div className="w-full rounded-[28px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse aspect-[16/10] sm:aspect-[16/9] min-h-[240px] relative p-6 flex flex-col justify-end">
            <div className="w-3/4 h-8 bg-slate-300 dark:bg-slate-800 rounded-xl mb-3" />
            <div className="w-36 h-10 bg-amber-400/30 dark:bg-amber-500/20 rounded-xl" />
          </div>
          <div className="w-full rounded-[28px] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 shadow-md animate-pulse aspect-[16/10] sm:aspect-[16/9] min-h-[240px] relative p-6 flex flex-col justify-end">
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
    <section
      ref={sectionRef}
      className="relative w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-10 max-w-[1600px] mx-auto overflow-visible"
    >
      {/* Orbes de energía ambiental detrás de los dos banners */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 left-1/4 w-72 h-72 rounded-full bg-amber-500/12 dark:bg-amber-400/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-1/4 w-72 h-72 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 blur-3xl"
      />

      <div
        className={`grid grid-cols-1 ${
          bannerRight ? 'lg:grid-cols-2' : ''
        } gap-8 sm:gap-10 lg:gap-10 items-center relative z-10`}
      >
        <InteractiveBannerCard
          banner={bannerLeft}
          index={0}
          scrollProgress={scrollProgress}
          isVisible={isVisible}
        />
        {bannerRight && (
          <InteractiveBannerCard
            banner={bannerRight}
            index={1}
            scrollProgress={scrollProgress}
            isVisible={isVisible}
          />
        )}
      </div>
    </section>
  );
}
