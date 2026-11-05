import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiSun, FiMoon } from 'react-icons/fi';
import LanguageSwitcher from '../common/LanguageSwitcher.jsx';
import HexagonalHivePattern from '../common/HexagonalHivePattern.jsx';
import cartagenaBg from '../../assets/cartagena-hero.jpg';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

const BRAND_LETTERS = [
  { char: 'E', isHive: false },
  { char: 'v', isHive: false },
  { char: 'e', isHive: false },
  { char: 'n', isHive: false },
  { char: 't', isHive: false },
  { char: 'H', isHive: true },
  { char: 'i', isHive: true },
  { char: 'v', isHive: true },
  { char: 'e', isHive: true },
];

/**
 * AuthLayout
 * Layout compartido para Inicio de Sesión y Registro.
 * - Panel Izquierdo: Fondo ambiental con gradiente, hexágonos y marca con animación secuencial.
 * - Panel Derecho: Formulario compacto con título EventHive animado en dispositivos móviles.
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
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const panelRef = useRef(null);
  const mousePos = useRef({ x: -9999, y: -9999 });
  const [animKey, setAnimKey] = useState(0);

  const handleReplayBrandAnimation = () => {
    setAnimKey((prev) => prev + 1);
  };

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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-slate-50 dark:bg-[#070D1B] font-body selection:bg-amber-400 selection:text-slate-950 transition-colors duration-300">
      
      {/* ========================================================
          PANEL IZQUIERDO: MARCA, GRADIENTES HERO Y HEXÁGONOS
          ======================================================== */}
      <div
        ref={panelRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex lg:w-[42%] xl:w-[40%] relative flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 overflow-hidden select-none transition-colors duration-500 border-r ${
          isDark
            ? 'bg-gradient-to-b from-[#0F172A] via-[#090D1A] to-[#05070F] text-white border-white/10'
            : 'bg-gradient-to-b from-[#EDF4F9] via-[#F8FAFC] to-[#F1F5F9] text-slate-900 border-slate-300/90'
        }`}
      >
        {/* 1. Fotografía de Cartagena Colonial con blend ambiental sutil */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-1000 ease-out hover:scale-103 ${
            isDark
              ? 'opacity-15 mix-blend-overlay'
              : 'opacity-10 mix-blend-multiply'
          }`}
          style={{ backgroundImage: `url('${cartagenaBg}')` }}
        />

        {/* 2. Capa de Hexágonos idéntica en tamaño y alineación al Hero */}
        <HexagonalHivePattern variant="auth" />

        {/* Separador vertical de la mitad */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-0 bottom-0 right-0 w-[1.5px] z-30 pointer-events-none bg-gradient-to-b from-amber-500/30 via-slate-300 to-amber-500/30 dark:from-amber-500/50 dark:via-white/20 dark:to-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
        />

        {/* Bloque Superior + Central alineados con animación de letras */}
        <div className="relative z-20 flex-1 flex flex-col justify-evenly w-full max-w-[360px] xl:max-w-[390px] mx-0">
          {/* Identidad EventHive con animación letra por letra */}
          <Link
            to="/"
            onMouseEnter={handleReplayBrandAnimation}
            onFocus={handleReplayBrandAnimation}
            aria-label="EventHive"
            className="self-center flex flex-col items-center w-fit focus:outline-none"
          >
            <span
              key={animKey}
              aria-hidden="true"
              className="font-display text-[54px] xl:text-[65px] font-black leading-none tracking-tight inline-flex items-baseline"
            >
              {BRAND_LETTERS.map(({ char, isHive }, index) => (
                <span
                  key={`${char}-${index}`}
                  style={{ animationDelay: `${index * 85}ms` }}
                  className={`inline-block animate-auth-letter ${
                    isHive
                      ? isDark
                        ? 'text-amber-400'
                        : 'text-amber-500'
                      : isDark
                        ? 'text-white'
                        : 'text-[#0F172A]'
                  }`}
                >
                  {char}
                </span>
              ))}
            </span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-2">
              Cartagena Cultural Experience
            </span>
          </Link>

          {/* Contenido Central */}
          <div className="text-left">
            <h1
              className={`font-display text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] font-black leading-[1.16] max-w-sm tracking-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {t('auth.leftTitle1')}{' '}
              <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
                {t('auth.leftTitleHighlight')}
              </span>{' '}
              {t('auth.leftTitle2')}
            </h1>

            <p
              className={`text-xs sm:text-sm mt-2.5 max-w-sm leading-relaxed font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              {t('auth.leftSubtitle')}
            </p>

            {/* Lista de características */}
            <div className="mt-5 space-y-2.5">
              {[
                t('auth.feature1'),
                t('auth.feature2'),
                t('auth.feature3'),
              ].map((feature) => (
                <div
                  key={feature}
                  className={`flex items-center gap-2.5 text-xs sm:text-[13px] font-medium ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border ${
                      isDark
                        ? 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                        : 'bg-amber-100 text-amber-600 border-amber-300'
                    }`}
                  >
                    <FiCheckCircle size={12} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie de Panel Izquierdo */}
        <div className="relative z-20 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-6">
          <p>{t('auth.copyright')}</p>
          <Link to="/" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold underline underline-offset-4">
            {t('auth.exploreEvents')}
          </Link>
        </div>
      </div>

      {/* ========================================================
          PANEL DERECHO: FORMULARIO COMPACTO Y ACCESIBLE
          ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 lg:p-8 xl:p-10 overflow-y-auto bg-white dark:bg-[#0B1428] text-slate-900 dark:text-slate-100 transition-colors duration-300 lg:border-l border-slate-200 dark:border-slate-800/80">
        
        {/* Barra Superior con Enlace de Navegación y Alternador de Tema */}
        <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <span className="text-[11px] font-bold">← Inicio</span>
          </Link>

          <div className="flex items-center gap-3 ml-auto">
            {topPromptText && topActionText && topActionHref && (
              <p className="text-slate-500 dark:text-slate-400 font-medium text-xs">
                {topPromptText}{' '}
                <Link
                  to={topActionHref}
                  className="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline underline-offset-2 ml-1"
                >
                  {topActionText}
                </Link>
              </p>
            )}

            {/* Selector de idioma ES / EN */}
            <LanguageSwitcher />

            {/* Alternador de tema Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}
              aria-label={t('navbar.toggleThemeAria')}
              className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'border-white/10 bg-slate-800/80 text-amber-400 hover:bg-slate-700 hover:border-amber-400/50'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-amber-700'
              }`}
            >
              {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
            </button>
          </div>
        </div>

        {/* Caja Central del Formulario */}
        <div className="auth-form w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto my-auto py-4 sm:py-6 [&_input]:py-2 [&_input]:text-xs [&_label]:mb-1 [&_label]:text-[11px]">
          
          {/* TÍTULO EVENTHIVE ANIMADO EXCLUSIVO PARA DISPOSITIVOS MÓVILES (Ubicado arriba del título inicio de sesión) */}
          <div className="lg:hidden mb-6 flex flex-col items-center justify-center text-center">
            <Link
              to="/"
              className="group inline-flex flex-col items-center gap-2.5 focus:outline-none"
              title="EventHive - Portal de Eventos"
            >
              {/* Isotipo con halo animado */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0B1B3D] via-[#0e214d] to-[#152e68] border border-amber-400/40 p-2 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md animate-pulse pointer-events-none" />
                <img
                  src="/LOGO45x50.png"
                  alt="EventHive Logo"
                  className="h-10 w-auto object-contain relative z-10 drop-shadow-md"
                  onError={(e) => {
                    e.currentTarget.src = '/LOGO32x32.png';
                  }}
                />
              </div>

              {/* Tipografía de Marca con animación de brillo suave */}
              <div className="flex flex-col items-center">
                <span className="font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  <span>Event</span>
                  <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 animate-pulse">
                    Hive
                  </span>
                </span>
                <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400">
                  Cartagena Cultural Experience
                </span>
              </div>
            </Link>
          </div>

          {title && (
            <div className="mb-3.5 text-center">
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#0B132B] dark:text-white tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {errorBanner && (
            <div className="mb-3.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-fade-in text-left">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorBanner}</span>
            </div>
          )}

          {children}
        </div>

        {/* Footer Legal */}
        <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-3">
          <p>
            {t('auth.legalPrefix')}{' '}
            <Link to="/terminos" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t('auth.termsLink')}
            </Link>{' '}
            {t('auth.legalMiddle')}{' '}
            <Link to="/privacidad" className="underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t('auth.privacyLink')}
            </Link>
            {t('auth.legalSuffix').startsWith('.') ? t('auth.legalSuffix') : ` ${t('auth.legalSuffix')}`}
          </p>
        </div>

      </div>
    </div>
  );
}
