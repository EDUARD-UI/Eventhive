import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

/**
 * CustomSelect
 * Componente desplegable estilizado que hace juego idéntico con el botón sin desplegar:
 * - Mismo fondo, bordes, sombras y tipografía.
 * - Despliegue con transiciones suaves, indicador de opción activa y cierre al hacer clic fuera.
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  className = '',
  dropdownClassName = '',
  variant = 'light', // 'light' | 'dark'
  inlineLabel = null,
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelect = (optValue) => {
    onChange({ target: { value: optValue } });
    setIsOpen(false);
  };

  const isDark = variant === 'dark';

  const isInlinePill = Boolean(inlineLabel || Icon);

  return (
    <div ref={containerRef} className={`relative select-none ${isOpen ? 'z-50' : 'z-10'} ${className}`}>
      {/* Botón cerrado */}
      {isInlinePill ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full h-[54px] flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs backdrop-blur-md ${
            isDark
              ? 'bg-[#0B1428]/95 border border-slate-800 hover:border-slate-700 text-white'
              : 'bg-white/95 dark:bg-[#0B1428]/95 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-900 dark:text-white'
          } ${
            isOpen
              ? isDark
                ? 'border-amber-400 ring-2 ring-amber-400/20'
                : 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/15'
              : ''
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                <Icon size={15} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {inlineLabel && (
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">
                  {inlineLabel}
                </span>
              )}
              <span className="block truncate text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                {displayText}
              </span>
            </div>
          </div>
          <FiChevronDown
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-500' : isDark ? 'text-slate-400' : 'text-slate-400 dark:text-slate-500'
            }`}
            size={15}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs ${
            isDark
              ? 'bg-[#0D182E] border border-slate-700 hover:border-slate-500 text-white'
              : 'bg-white dark:bg-[#0B1428] border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 text-slate-900 dark:text-white'
          } ${isOpen ? (isDark ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-800 dark:border-amber-500 ring-2 ring-slate-800/10 dark:ring-amber-500/20') : ''}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{displayText}</span>
          <FiChevronDown
            className={`shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-500' : isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
            }`}
            size={14}
          />
        </button>
      )}

      {/* Menú desplegado con exactamente el mismo estilo */}
      {isOpen && (
        <ul
          role="listbox"
          className={`absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto rounded-xl p-1.5 z-[100] shadow-2xl transition-all duration-200 ${
            isDark
              ? 'bg-[#0D182E] border border-slate-700 text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)]'
              : 'bg-white dark:bg-[#0B1428] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)]'
          } ${dropdownClassName}`}
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? isDark
                      ? 'bg-amber-400/15 text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <FiCheck className="shrink-0 text-amber-500 ml-2" size={14} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
