import React, { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * StyledDatePicker
 * Componente interactivo de calendario personalizado para EventHive:
 * - Elimina el popover genérico del navegador.
 * - Incluye selector de mes/año, días del mes, selección rápida de "Hoy" y "Limpiar".
 * - Totalmente adaptado a modo claro y modo oscuro.
 */
export default function StyledDatePicker({
  id,
  name,
  label,
  inlineLabel = null,
  value,
  onChange,
  minDate,
  allowPast = false,
  required = false,
  placeholder = 'Selecciona una fecha',
  className = '',
  disabled = false,
  error = null,
  helperText = null,
  variant = 'light', // 'light' | 'dark'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha actual como punto de referencia
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const effectiveMin = allowPast ? null : (minDate || todayStr);

  // Estado del mes visualizado en el calendario
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Sincronizar mes visualizado si el valor cambia externamente
  useEffect(() => {
    if (value) {
      const parsed = new Date(value + 'T00:00:00');
      if (!isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isDark = variant === 'dark';

  // Navegar meses
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calcular días del mes para cuadrícula (Lunes a Domingo)
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const handleSelectDay = (day) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (onChange) {
      onChange({ target: { name, value: formatted } });
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
    setIsOpen(false);
  };

  const handleSelectToday = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange({ target: { name, value: todayStr } });
    }
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Formato amigable de lectura para el campo (ej: "17 oct 2026")
  const formattedDisplay = (() => {
    if (!value) return '';
    try {
      const parts = value.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return value;
    } catch {
      return value;
    }
  })();

  return (
    <div className={`${inlineLabel ? '' : 'space-y-1.5'} relative ${className}`} ref={containerRef}>
      {label && !inlineLabel && (
        <label
          htmlFor={id || name}
          className={`block text-[11px] font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Botón / Input visual interactivo */}
      {inlineLabel ? (
        <div
          id={id || name}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`relative h-[54px] flex items-center justify-between gap-2.5 rounded-2xl border px-3.5 py-2 transition-all shadow-xs backdrop-blur-md cursor-pointer select-none ${
            isDark
              ? 'bg-[#0B1428]/95 border-slate-800 text-white hover:border-slate-700'
              : 'bg-white/95 dark:bg-[#0B1428]/95 border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-700'
          } ${
            isOpen
              ? isDark
                ? 'border-amber-400 ring-2 ring-amber-400/20'
                : 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/15'
              : ''
          } ${error ? 'border-rose-400' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
              <FiCalendar size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">
                {inlineLabel}
              </span>
              <span
                className={`block truncate text-xs sm:text-[13px] leading-tight ${
                  formattedDisplay
                    ? 'font-bold text-slate-900 dark:text-white'
                    : 'font-semibold text-slate-500 dark:text-slate-400'
                }`}
              >
                {formattedDisplay || placeholder}
              </span>
            </div>
          </div>

          {value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
              title="Limpiar fecha"
            >
              <FiX size={14} />
            </button>
          ) : null}
        </div>
      ) : (
        <div
          id={id || name}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`relative flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all shadow-2xs cursor-pointer select-none ${
            isDark
              ? 'bg-[#0B0F19] border-slate-700 text-white hover:border-slate-500 focus-within:border-amber-400'
              : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 focus-within:border-amber-500'
          } ${isOpen ? 'ring-2 ring-amber-500/30 border-amber-500' : ''} ${
            error ? 'border-rose-400' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <FiCalendar
              size={16}
              className={`shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-500'}`}
            />
            <span
              className={`text-xs sm:text-sm font-semibold truncate ${
                formattedDisplay
                  ? (isDark ? 'text-white' : 'text-slate-900')
                  : (isDark ? 'text-slate-500' : 'text-slate-400 font-normal')
              }`}
            >
              {formattedDisplay || placeholder}
            </span>
          </div>

          {value && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              title="Limpiar fecha"
            >
              <FiX size={14} />
            </button>
          ) : null}
        </div>
      )}

      {/* Calendario Flotante Personalizado */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-2 z-50 w-72 sm:w-80 rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all animate-fade-in-up ${
            isDark
              ? 'bg-[#0B1428] border-slate-700/80 text-white shadow-[0_12px_40px_rgba(0,0,0,0.7)]'
              : 'bg-white border-slate-200 text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.15)]'
          }`}
        >
          {/* Cabecera del Mes / Año */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes anterior"
            >
              <FiChevronLeft size={16} />
            </button>

            <span className="font-extrabold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} <span className="text-amber-500">{viewYear}</span>
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Mes siguiente"
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {w}
              </span>
            ))}
          </div>

          {/* Cuadrícula de Días */}
          <div className="grid grid-cols-7 gap-1">
            {/* Días del mes previo (inactivos) */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div
                key={`prev-${i}`}
                className="h-8 flex items-center justify-center text-xs text-slate-300 dark:text-slate-700 select-none pointer-events-none"
              >
                {prevMonthDays - firstDayIndex + i + 1}
              </div>
            ))}

            {/* Días del mes actual */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const currentIso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = value === currentIso;
              const isToday = todayStr === currentIso;
              const isPast = effectiveMin ? currentIso < effectiveMin : false;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md scale-105'
                      : isToday
                      ? 'border-2 border-amber-500 text-amber-500 dark:text-amber-400 font-extrabold hover:bg-amber-50 dark:hover:bg-amber-950/40'
                      : isPast
                      ? 'opacity-30 cursor-not-allowed text-slate-400'
                      : isDark
                      ? 'hover:bg-slate-800 text-slate-200'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Acciones de pie: "Hoy" y "Limpiar" */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={handleSelectToday}
              className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Ir a hoy
            </button>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
              >
                Limpiar filtro
              </button>
            )}
          </div>
        </div>
      )}

      {error ? (
        <p className="text-[11px] font-semibold text-rose-500 animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
