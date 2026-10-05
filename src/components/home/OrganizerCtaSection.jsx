import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import { session, normalizeRole } from '../../services/session.js';

/**
 * OrganizerCtaSection
 * Franja horizontal CTA para Organizadores ubicada justo encima del Footer.
 * - Fondo azul oscuro de marca (#0B132B) con bordes redondeados (rounded-2xl sm:rounded-3xl)
 * - Distribución en Flex:
 *   - Izquierda: Título H3 "Potencia tus ventas con EventHive" y subtítulo explicativo corto.
 *   - Derecha: Botón de acción destacado "CREAR MI ORGANIZACIÓN →" con fondo amarillo/dorado.
 * - Título limpio y sin textos duplicados o montados.
 * - Excelente rendimiento visual tanto en PC/portátiles como en móvil.
 */
export default function OrganizerCtaSection() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getHomeBanners()
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data)) {
          const cta = data.find((b) => b.posicion === 2);
          if (cta) setBanner(cta);
        }
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, []);

  const user = session.getUser();
  const role = normalizeRole(user?.role || user?.rol);
  const isOrganizer = role === 'REPRESENTANTE' || role === 'ORGANIZADOR' || role === 'OPERADOR';
  const defaultTarget = isOrganizer ? '/organizacion' : '/registro';
  const ctaLink = banner?.enlaceUrl && !banner.enlaceUrl.startsWith('#') ? banner.enlaceUrl : defaultTarget;
  const isExternal = ctaLink.startsWith('http');

  return (
    <section className="w-full py-10 sm:py-14 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#123B68] border border-amber-500/25 p-7 sm:p-10 lg:p-12 shadow-2xl">
        {/* Destellos ambientales dorados y azulados sutiles */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Patrón de panal sutil en marca de agua */}
        <svg
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-2/5 opacity-5 pointer-events-none select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern id="cta-honeycomb-pattern" width="48" height="83.14" patternUnits="userSpaceOnUse">
            <path
              d="M24 0 L48 13.86 L48 41.57 L24 55.43 L0 41.57 L0 13.86 Z M24 83.14 L48 69.28 L48 41.57 L24 55.43 L0 41.57 L0 69.28 Z"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="0.8"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#cta-honeycomb-pattern)" />
        </svg>

        {/* Contenido en Flex horizontal para PC/laptops y vertical para móviles */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
          {/* Izquierda: Badge, Título H3 y subtítulo explicativo corto */}
          <div className="max-w-2xl space-y-2 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Para Organizadores de Eventos</span>
            </div>

            <h3 className="font-display font-black text-white text-2xl sm:text-3xl lg:text-[32px] tracking-tight leading-snug">
              Potencia tus ventas con EventHive
            </h3>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 font-normal leading-relaxed">
              Publica tus eventos, gestiona tu boletería en tiempo real con validación QR y conecta con miles de asistentes en Cartagena y toda Colombia.
            </p>
          </div>

          {/* Derecha: Botón de acción destacado "CREAR MI ORGANIZACIÓN →" */}
          <div className="shrink-0 flex items-center">
            {isExternal ? (
              <a
                href={ctaLink}
                target="_self"
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-amber-500/30 active:scale-95 group/btn cursor-pointer whitespace-nowrap"
              >
                <span>CREAR MI ORGANIZACIÓN</span>
                <FiArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </a>
            ) : (
              <Link
                to={ctaLink}
                className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-amber-500/30 active:scale-95 group/btn cursor-pointer whitespace-nowrap"
              >
                <span>CREAR MI ORGANIZACIÓN</span>
                <FiArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}