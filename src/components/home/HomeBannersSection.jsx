import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import ImageWithFallback from '../common/ImageWithFallback.jsx';

/**
 * InteractiveBannerCard
 * Tarjeta 3D interactiva inspirada en Blendo con:
 * - Inclinación 3D en tiempo real al mover el cursor + parallax interno en la imagen.
 * - Desfase vertical y rotación suave sincronizada al scroll.
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

    const rx = ((y - cy) / cy) * -5.5;
    const ry = ((x - cx) / cx) * 5.5;
    const imgX = ((x - cx) / cx) * -10;
    const imgY = ((y - cy) / cy) * -10;

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
  const active = isVisible || scrollProgress > 0.1;

  // Movimiento contrapuesto al hacer scroll (el izquierdo sube suavemente mientras el derecho baja)
  const scrollWaveY = active
    ? (scrollProgress - 0.5) * (isLeft ? -22 : 22)
    : isLeft
    ? 50
    : 75;

  const entryRotateZ = isLeft ? -1.2 : 1.2;
  const currentRotateZ = active
    ? mouse.hovered
      ? 0
      : (scrollProgress - 0.5) * (isLeft ? 1.4 : -1.4)
    : entryRotateZ * 2.5;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: active ? 1 : 0,
        transform: active
          ? `perspective(1300px) translate3d(0px, ${scrollWaveY.toFixed(1)}px, ${mouse.hovered ? '20px' : '0px'}) rotateX(${mouse.rx.toFixed(2)}deg) rotateY(${mouse.ry.toFixed(2)}deg) rotateZ(${currentRotateZ.toFixed(2)}deg) scale(${mouse.hovered ? 1.02 : 1})`
          : `perspective(1300px) translate3d(${isLeft ? '-40px' : '40px'}, 60px, -50px) rotateX(12deg) rotateY(${isLeft ? '10deg' : '-10deg'}) rotateZ(${isLeft ? '-3deg' : '3deg'}) scale(0.92)`,
        transitionProperty: mouse.hovered ? 'box-shadow' : 'transform, opacity',
        transitionDuration: mouse.hovered ? '150ms' : '900ms',
        transitionDelay: mouse.hovered ? '0ms' : `${index * 160}ms`,
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
                fallbackText={banner.titulo || 'Banner'}
                iconSize={36}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#132242] via-[#0D1527] to-slate-950 relative" />
            )}
          </div>

          {/* Degradado inferior nítido para elevar la legibilidad sin apagar la fotografía */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(7,13,27,0.12) 0%, transparent 38%, rgba(7,13,27,0.88) 100%)',
            }}
          />

          

          {/* Dock inferior flotante con título audaz y botón interactivo estilo Blendo */}
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-8 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-4 pointer-events-none">
            <div className="max-w-md">
              {banner.titulo && (
                <h3 className="font-black text-white group-hover:text-amber-200 text-xl sm:text-2xl lg:text-[26px] leading-tight tracking-tight uppercase drop-shadow-[0_3px_12px_rgba(0,0,0,0.9)] transition-colors duration-300">
                  {banner.titulo}
                </h3>
              )}
            </div>

            {banner.textoBoton && (
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2.5 pl-4 pr-2.5 py-2 sm:pl-5 sm:pr-3 sm:py-2.5 rounded-2xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider border-2 border-slate-950 shadow-[0_5px_0_0_rgba(15,23,42,1)] group-hover:translate-y-[-2px] group-hover:shadow-[0_7px_0_0_rgba(15,23,42,1)] transition-all duration-200">
                  <span>{banner.textoBoton}</span>
                  <span className="w-7 h-7 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center transition-transform duration-300 group-hover:rotate-45">
                    <FiArrowUpRight size={15} strokeWidth={2.5} />
                  </span>
                </span>
              </div>
            )}
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}

export default function HomeBannersSection() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsVisible(true);
        });
      },
      { threshold: 0.1 }
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
        if (rect.top <= vh * 0.9) setIsVisible(true);
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
