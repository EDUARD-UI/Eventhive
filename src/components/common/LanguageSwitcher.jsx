import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const LANGUAGE_OPTIONS = [
  { code: 'es', label: 'Español - ES', short: 'ES' },
  { code: 'en', label: 'English - EN', short: 'EN' },
];

/**
 * LanguageSwitcher
 * Selector desplegable de idioma (Español - ES / English - EN)
 * con iconos de Lucide React y diseño sincronizado con el botón de tema de EventHive.
 */
export default function LanguageSwitcher({ variant = 'auto' }) {
  const { language, setLanguage, t } = useLanguage();
  const { isDark: themeIsDark } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const isDark = variant === 'light' ? false : variant === 'dark' ? true : themeIsDark;
  const activeOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleSelect = (code) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative flex items-center" data-no-translate="true">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={t('navbar.languageTitle')}
        aria-label={t('navbar.languageAria')}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`h-[35px] px-2.5 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
          isDark
            ? 'border-white/10 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-400/50 focus-visible:ring-offset-[#0B0F19]'
            : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-amber-700 hover:border-amber-400/60 focus-visible:ring-offset-white'
        }`}
      >
        <Globe
          size={15}
          className={isDark ? 'text-amber-400 shrink-0' : 'text-slate-700 shrink-0'}
        />
        <span className="tracking-wider uppercase text-[11px] font-extrabold leading-none">
          {activeOption.short}
        </span>
        <ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-amber-400' : 'opacity-75'
          }`}
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute right-0 top-full mt-2.5 w-44 rounded-2xl p-1.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#0B1428] border-white/10 text-slate-100 shadow-[0_12px_35px_rgba(0,0,0,0.65)]'
              : 'bg-white border-slate-200/90 text-slate-800 shadow-[0_12px_30px_rgba(15,23,42,0.12)]'
          }`}
        >
          {/* Pequeño indicador triangular superior estilo popover */}
          <div
            aria-hidden="true"
            className={`absolute -top-1.5 right-5 w-3 h-3 rotate-45 border-l border-t ${
              isDark
                ? 'bg-[#0B1428] border-white/10'
                : 'bg-white border-slate-200/90'
            }`}
          />

          <div className="relative z-10 flex flex-col divide-y divide-slate-100 dark:divide-white/[0.06]">
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left ${
                    isSelected
                      ? isDark
                        ? 'bg-amber-500/15 text-amber-300 font-bold'
                        : 'bg-amber-50 text-slate-950 font-bold'
                      : isDark
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-950'
                  }`}
                >
                  {/* Radio button visual fiel a la referencia */}
                  <span
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-transparent'
                        : isDark
                        ? 'border-slate-500'
                        : 'border-slate-400'
                    }`}
                  >
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

