import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';
import BeeParticles from '../home/BeeParticles.jsx';
import cartagenaBg from '../../assets/cartagena-hero.jpg';

/**
 * AuthLayout
 * Layout compartido para Inicio de Sesión y Registro.
 * - Panel Izquierdo: Azul marino nocturno (#0B132B) + Foto de Cartagena colonial de fondo
 *   + Malla hexagonal dorada interactiva + 5 abejas realistas con física orbital y estela de miel.
 * - Panel Derecho: Formulario limpio con tipografía y acentos acordes a la paleta de la marca.
 */
export default function AuthLayout({
  children,
  title,
  subtitle,
  topPromptText,
  topActionText,
  topActionHref,
  errorBanner,
}) {
  const panelRef = useRef(null);
  const mousePos = useRef({ x: -9999, y: -9999 });

  const handleMouseMove = (e) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mousePos.current = { x: -9999, y: -9999 };
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-body selection:bg-amber-400 selection:text-slate-950">
      {/* Panel Izquierdo de Marca con Paleta de Colmena, Foto Colonial y Abejas */}
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 text-white overflow-hidden bg-[#0B132B] group/panel select-none"
      >
        {/* 1. Fotografía de Cartagena Colonial con blend suave */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center pointer-events-none mix-blend-overlay opacity-30 transition-transform duration-1000 ease-out group-hover/panel:scale-105"
          style={{ backgroundImage: `url('${cartagenaBg}')` }}
        />

        {/* 2. Gradientes ambientales nocturnos con resplandores dorados */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#080E1D]/90 via-[#0B132B]/80 to-[#0B132B] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -left-24 w-88 h-88 bg-amber-500/15 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 group-hover/panel:opacity-90"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-16 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"
        />

        {/* 3. Malla Hexagonal de Panal interactiva (sutil, encendida al hover) */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-15 group-hover/panel:opacity-80 transition-opacity duration-700 pointer-events-none">
            <defs>
              <pattern
                id="auth-honeycomb-pattern"
                width="64"
                height="110.85"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M32 0 L64 18.475 L64 55.425 L32 73.9 L0 55.425 L0 18.475 Z M32 110.85 L64 92.375 L64 55.425 L32 73.9 L0 55.425 L0 92.375 Z"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                  className="group-hover/panel:stroke-opacity-90 transition-all duration-700"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-honeycomb-pattern)" />
          </svg>
        </div>

        {/* 4. Abejas Realistas Doradas y Negras con física orbital e interacción */}
        <BeeParticles mousePos={mousePos} />

        {/* Logo EventHive en la parte superior */}
        <Link to="/" className="relative z-20 flex items-center w-fit group">
          <AppLogo className="h-8 w-fit" textClassName="text-white text-base" hiveClassName="text-amber-500" />
        </Link>

        {/* Contenido Central Inspirador */}
        <div className="relative z-20 my-auto py-8 text-left">

          <h1 className="font-display text-3xl sm:text-4xl lg:text-[40px] font-black leading-[1.14] max-w-md text-white tracking-tight">
            Vive la <span className="text-amber-400 drop-shadow-[0_0_14px_rgba(245,158,11,0.5)]">Magia</span> de la Heroica, evento a evento.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 mt-4 max-w-md leading-relaxed font-normal">
            Descubre música, festivales, gastronomía y cultura local. Gestiona tus entradas o publica tus propios eventos de forma ágil y segura.
          </p>

          <div className="mt-8 space-y-3.5">
            {[
              'Boletos 100% verificados con código QR digital',
              'Geolocalización y mapa interactivo en tiempo real',
              'Comunidad activa de asistentes y organizaciones',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-xs sm:text-sm text-slate-200 font-medium">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                  <FiCheckCircle size={13} className="text-amber-400" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie de Panel Izquierdo */}
        <div className="relative z-20 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <p>© 2026 EventHive. Todos los derechos reservados.</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold underline underline-offset-4">
            Explorar eventos
          </Link>
        </div>
      </div>

      {/* Contenedor Derecho del Formulario */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-white">
        {/* Barra Superior con Enlace de Cambio */}
        <div className="flex items-center justify-between lg:justify-end gap-3 text-xs sm:text-sm">
          <Link to="/" className="lg:hidden flex items-center">
            <AppLogo className="h-8 w-fit" textClassName="text-[#0B132B] text-base" hiveClassName="text-amber-500" />
          </Link>

          {topPromptText && topActionText && topActionHref && (
            <p className="text-slate-500 font-medium">
              {topPromptText}{' '}
              <Link
                to={topActionHref}
                className="font-bold text-amber-600 hover:text-amber-700 transition-colors underline underline-offset-2 ml-1"
              >
                {topActionText}
              </Link>
            </p>
          )}
        </div>

        {/* Caja de Contenido del Formulario */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {title && (
            <div className="mb-6 text-left">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-2">{subtitle}</p>}
            </div>
          )}

          {errorBanner && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fade-in text-left">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {children}
        </div>

        {/* Footer Legal */}
        <div className="text-center text-xs text-slate-400 pt-6">
          <p>
            Al continuar, aceptas los{' '}
            <Link to="/terminos" className="underline hover:text-slate-600 transition-colors">Términos de Servicio</Link> y la{' '}
            <Link to="/privacidad" className="underline hover:text-slate-600 transition-colors">Política de Privacidad</Link> de EventHive.
          </p>
        </div>
      </div>
    </div>
  );
}