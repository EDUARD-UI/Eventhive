import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * DirectLanguagePillToggle
 * Botón píldora compacto (sin dropdown select) que alterna directamente entre ES y EN al hacer click.
 * Incluye ícono de globo y tooltip "Cambiar idioma".
 */
export default function DirectLanguagePillToggle() {
  const { language, setLanguage } = useLanguage();
  const { isDark } = useTheme();

  const currentLang = (language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';

  const handleToggle = (e) => {
    e.preventDefault();
    const nextLang = currentLang === 'es' ? 'en' : 'es';
    setLanguage(nextLang);
  };

  return (
    <div className="relative group inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Cambiar idioma"
        className={`px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none ${
          isDark
            ? 'border-[#1E3A5F] bg-[#0F2342] text-slate-200 hover:border-[#F5B800] hover:text-[#F5B800]'
            : 'border-[#CBD5E1] bg-[#FFFFFF] text-[#0F2342] hover:border-[#0F2342] shadow-2xs'
        }`}
      >
        <Globe size={14} className={isDark ? 'text-[#F5B800]' : 'text-[#0F2342]'} />
        <span>{currentLang === 'es' ? 'EN' : 'ES'}</span>
      </button>

      {/* Tooltip limpio "Cambiar idioma" */}
      <div className="absolute right-0 -bottom-9 hidden group-hover:flex items-center px-2.5 py-1 rounded-[6px] bg-[#0F2342] text-white text-[11px] font-mono whitespace-nowrap shadow-xl border border-white/10 z-30 pointer-events-none">
        Cambiar idioma
      </div>
    </div>
  );
}