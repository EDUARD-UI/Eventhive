import { useState, useRef } from 'react';
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
 * - Panel Izquierdo: Fondo ambiental con gradiente idéntico al <Hero>
 *   y capa de hexágonos del mismo tamaño y alineación que el Hero.
 * - Separador central nítido y visible en Modo Claro y Modo Oscuro.
 * - Panel Derecho: Formulario compacto sin necesidad de scroll vertical en pantallas estándar.
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
  const [animKey, setAnimKey] = useState(0);
  const isAnimatingRef = useRef(false);

  const handleReplayBrandAnimation = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setAnimKey((prev) => prev + 1);
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 950);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-slate-50 dark:bg-[#070D1B] font-body selection:bg-amber-400 selection:text-slate-950 transition-colors duration-300">

      {/* ========================================================
          PANEL IZQUIERDO: MARCA, GRADIENTES HERO Y HEXÁGONOS
          ======================================================== */}
      <div
        className={`hidden lg:flex lg:w-[42%] xl:w-[40%] relative flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-10 overflow-hidden select-none transition-colors duration-500 border-r ${isDark
          ? 'bg-gradient-to-b from-[#0F172A] via-[#090D1A] to-[#05070F] text-white border-white/10'
          : 'bg-gradient-to-b from-[#EDF4F9] via-[#F8FAFC] to-[#F1F5F9] text-slate-900 border-slate-300/90'
          }`}
      >
        {/* 1. Fotografía de Cartagena Colonial con blend ambiental sutil */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-transform duration-1000 ease-out hover:scale-103 ${isDark
            ? 'opacity-15 mix-blend-overlay'
            : 'opacity-10 mix-blend-multiply'
            }`}
          style={{ backgroundImage: `url('${cartagenaBg}')` }}
        />

        {/* 2. Capa de Hexágonos idéntica en tamaño y alineación al Hero */}
        <HexagonalHivePattern variant="auth" />


        {/* Separador vertical de la mitad (Línea continua acentuada y visible en claro/oscuro) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute top-0 bottom-0 right-0 w-[1.5px] z-30 pointer-events-none bg-gradient-to-b from-amber-500/30 via-slate-300 to-amber-500/30 dark:from-amber-500/50 dark:via-white/20 dark:to-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]"
        />

        {/* Bloque Superior + Central alineados en el mismo eje izquierdo del diseño */}
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
                  className={`inline-block animate-auth-letter ${isHive
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
          </Link>

          {/* Contenido Central: Proporciones compactas y tipografía calibrada */}
          <div className="ml-4 xl:ml-8 w-full max-w-[360px] xl:max-w-[390px] py-2 text-left">
            <h1
              className={`font-display text-2xl sm:text-3xl lg:text-[24px] xl:text-[27px] font-black leading-[1.16] max-w-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-950'
                }`}
            >
              {t('auth.leftTitle1')}{' '}
              <span className={isDark ? 'text-amber-400' : 'text-amber-600'}>
                {t('auth.leftTitleHighlight')}
              </span>{' '}
              {t('auth.leftTitle2')}
            </h1>


            {/* Lista de características con iconos compactos */}
            <div className="mt-5 space-y-2.5">
              {[
                t('auth.feature1'),
                t('auth.feature2'),
                t('auth.feature3'),
              ].map((feature) => (
                <div
                  key={feature}
                  className={`flex items-center gap-2.5 text-[11px] font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border ${isDark
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
        <div className="relative z-20 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-5">
          <Link to="/" className="ml-4 xl:ml-8 text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors font-semibold underline underline-offset-4">
            {t('auth.exploreEvents')}
          </Link>
        </div>
      </div>

      {/* ========================================================
          PANEL DERECHO: FORMULARIO COMPACTO Y ACCESIBLE
          ======================================================== */}
      <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 lg:p-8 xl:p-10 overflow-y-auto bg-white dark:bg-[#0B1428] text-slate-900 dark:text-slate-100 transition-colors duration-300 lg:border-l border-slate-200 dark:border-slate-800/80">

        {/* Barra Superior con Enlace de Navegación y Alternador de Tema */}
        <div className="flex items-center justify-end gap-3 text-xs sm:text-sm">
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

            {/* Alternador de tema Claro / Oscuro con alta visibilidad */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? t('navbar.lightMode') : t('navbar.darkMode')}
              aria-label={t('navbar.toggleThemeAria')}
              className={`p-1.5 sm:p-2 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${isDark
                ? 'border-white/10 bg-slate-800/80 text-amber-400 hover:bg-slate-700 hover:border-amber-400/50'
                : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-amber-700'
                }`}
            >
              {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
            </button>
          </div>
        </div>

        {/* Caja Central del Formulario */}
        <div className="auth-form w-full max-w-md sm:max-w-lg lg:max-w-lg mx-auto my-auto py-4 sm:py-6 [&_input]:py-2 [&_input]:text-xs [&_label]:mb-1 [&_label]:text-[11px]">
          {title && (
            <div className="mb-3.5 text-center">
              <h2 className="font-display text-xl sm:text-2xl font-black text-[#0B132B] dark:text-white tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-snug">
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

        {/* Footer Legal con enlaces accesibles */}
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
