import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';

export default function AuthLayout({
  children,
  title,
  subtitle,
  topPromptText,
  topActionText,
  topActionHref,
  errorBanner,
}) {
  return (
    <div className="min-h-screen flex bg-bg font-body selection:bg-brand-light selection:text-brand">
      {/* Panel Izquierdo de Marca con Fondo Azul Oficial de Cartagena */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 text-white overflow-hidden bg-[radial-gradient(120%_140%_at_15%_-10%,#2b9dff_0%,#007BFF_45%,#0047a8_100%)]">
        {/* Elementos geométricos decorativos translúcidos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-10 bottom-24 w-60 h-60 rounded-full bg-[#ffc107]/15 blur-3xl"
        />

        {/* Logo EventHive */}
        <Link to="/" className="relative z-10 flex items-center w-fit group">
          <AppLogo className="h-8 w-fit" textClassName="text-base" hiveClassName="text-brand" />
        </Link>

        {/* Contenido Central Inspirador */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-[#ffc107] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ffc107] animate-pulse" />
            La plataforma líder de eventos en Cartagena
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight max-w-md text-white">
            Vive la Magia de la Heroica, evento a evento.
          </h1>

          <p className="text-base text-sky-100/90 mt-4 max-w-md leading-relaxed">
            Descubre festivales, arte, gastronomía y cultura local. Gestiona tus entradas o publica tus propios eventos de forma ágil y segura.
          </p>

          <div className="mt-8 space-y-3">
            {[
              'Boletos 100% verificados con código QR digital',
              'Geolocalización interactiva en tiempo real',
              'Comunidad activa de organizaciones y asistentes',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm text-sky-50 font-medium">
                <FiCheckCircle className="text-[#ffc107] shrink-0" size={17} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie de Panel Izquierdo */}
        <div className="relative z-10 flex items-center justify-between text-xs text-sky-100/70 border-t border-white/15 pt-6">
          <p>© 2026 EventHive. Todos los derechos reservados.</p>
          <Link to="/" className="hover:text-white transition-colors underline underline-offset-4">
            Explorar eventos
          </Link>
        </div>
      </div>

      {/* Contenedor Derecho del Formulario */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto">
        {/* Barra Superior con Enlace de Cambio */}
        <div className="flex items-center justify-between lg:justify-end gap-3 text-xs sm:text-sm">
          <Link to="/" className="lg:hidden flex items-center">
            <AppLogo className="h-8 w-fit" textClassName="text-base" hiveClassName="text-brand" />
          </Link>

          {topPromptText && topActionText && topActionHref && (
            <p className="text-muted">
              {topPromptText}{' '}
              <Link
                to={topActionHref}
                className="font-semibold text-brand hover:text-brand-dark transition-colors underline underline-offset-2 ml-1"
              >
                {topActionText}
              </Link>
            </p>
          )}
        </div>

        {/* Caja de Contenido del Formulario */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {title && (
            <div className="mb-6">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-sm text-muted mt-2">{subtitle}</p>}
            </div>
          )}

          {errorBanner && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-fade-in">
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
            <a href="#" className="underline hover:text-slate-600 transition-colors">Términos de Servicio</a> y la{' '}
            <a href="#" className="underline hover:text-slate-600 transition-colors">Política de Privacidad</a> de EventHive.
          </p>
        </div>
      </div>
    </div>
  );
}
