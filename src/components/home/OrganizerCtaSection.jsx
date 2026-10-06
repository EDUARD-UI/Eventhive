import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { getHomeBanners } from '../../services/bannerService.js';
import { session, normalizeRole } from '../../services/session.js';

/**
 * OrganizerCtaSection
 * Rediseño Premium de la Tarjeta "Para Organizadores de Eventos":
 * - Banner panorámico de alta conversión con fondo oscuro profundo y detalles dorados.
 * - Estructura asimétrica a 2 columnas en Desktop y apilado ordenado en Mobile.
 * - Columna Izquierda: Badge "💼 MODO ORGANIZADOR", título destacado, descripción y 3 features con check dorado.
 * - Columna Derecha: Slot de mockup/composición visual con botón CTA ámbar destacado "CREAR MI ORGANIZACIÓN →".
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
      .catch(() => {});

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

  const CtaButton = ({ className = '' }) => {
    const content = (
      <>
        <span>CREAR MI ORGANIZACIÓN</span>
        <FiArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
      </>
    );

    const baseClass = `bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 cursor-pointer uppercase tracking-wider text-xs sm:text-sm whitespace-nowrap group ${className}`;

    if (isExternal) {
      return (
        <a href={ctaLink} target="_self" className={baseClass}>
          {content}
        </a>
      );
    }

    return (
      <Link to={ctaLink} className={baseClass}>
        {content}
      </Link>
    );
  };

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* 1. Contenedor Principal Panorámico Premium */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-[#071329] via-[#0b1c3d] to-[#0c1f45] p-6 sm:p-10 lg:p-12 shadow-2xl">

        {/* Destello de luz dorado tenue en la esquina superior izquierda */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"
        />

        {/* Destello sutil azul-cian complementario en la esquina inferior derecha */}
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* Textura geométrica colmena en marca de agua */}
        <svg
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.04] pointer-events-none select-none"
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

        {/* Estructura a 2 columnas en Desktop y Apilado en Mobile */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* 2. Columna Izquierda (Copy & Beneficios) */}
          <div className="lg:col-span-7 space-y-5 text-left">

            {/* Título: Tipografía grande, bold y blanca con acento dorado */}
            <h3 className="font-display font-extrabold text-white text-2xl sm:text-3xl lg:text-4xl tracking-tight leading-tight">
              Potencia <span className="text-amber-400">tus ventas</span> con EventHive
            </h3>

            {/* Descripción en gris claro legible */}
            <p className="text-slate-300 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl">
              Publica tus eventos, gestiona tu boletaría en tiempo real con validación QR y conecta con miles de asistentes en Cartagena y toda Colombia.
            </p>

            {/* Features: Fila horizontal de 3 ventajas acompañadas de check dorado */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FiCheck size={13} className="stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Validación QR rápida
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FiCheck size={13} className="stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Métricas en tiempo real
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 backdrop-blur-xs">
                <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FiCheck size={13} className="stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-200">
                  Pagos y liquidación directa
                </span>
              </div>
            </div>
          </div>

          {/* 3. Columna Derecha (Visual Slot + CTA) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-6 w-full">
            {/* <!-- SLOT DE IMAGEN DERECHA: Insertar aquí el mockup/composición --> */}
            <div className="w-full relative min-h-[200px] sm:min-h-[260px] lg:min-h-[280px] rounded-2xl border border-slate-700/60 bg-gradient-to-b from-slate-900/80 to-[#081226]/90 p-5 shadow-inner backdrop-blur-xs overflow-hidden flex flex-col justify-between group">
              {/* Resplandor interno decorativo */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mockup interactivo en slot con métricas de ventas y validación QR */}
              <div className="space-y-3 relative z-10 w-full">
              </div>


              {/* Botón CTA dentro de la columna derecha para visualización óptima */}
              <div className="pt-4 relative z-10 w-full flex justify-center">
                <CtaButton className="w-full sm:w-auto" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}