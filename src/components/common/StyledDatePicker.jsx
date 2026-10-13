import React from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

/**
 * StyledDatePicker
 * Componente estilizado para selección de fecha que:
 * - Fuerza por defecto que solo se puedan seleccionar fechas desde hoy hacia adelante (min = hoy).
 * - Estiliza el input con diseño premium, icono y estados interactivos sin aspecto por defecto.
 */
export default function StyledDatePicker({
  id,
  name,
  label,
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
  // Fecha mínima: día de hoy en formato YYYY-MM-DD según zona horaria local
  const todayStr = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const effectiveMin = allowPast ? undefined : (minDate || todayStr);

  const isDark = variant === 'dark';

  const baseContainerStyle = isDark
    ? 'bg-[#081026] border-slate-700 text-white focus-within:border-amber-500 focus-within:ring-amber-500/20'
    : 'bg-slate-50/90 border-slate-200 text-slate-800 focus-within:bg-white focus-within:border-brand focus-within:ring-brand/10';

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className={`block text-xs font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div
        className={`relative flex items-center rounded-xl border px-3.5 py-2.5 transition-all shadow-2xs focus-within:ring-2 ${baseContainerStyle} ${
          error ? 'border-rose-400 focus-within:border-rose-500' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <FiCalendar
          size={16}
          className={`shrink-0 mr-2.5 pointer-events-none transition-colors ${
            isDark ? 'text-amber-400' : 'text-brand'
          }`}
        />

        <input
          id={id || name}
          name={name}
          type="date"
          value={value || ''}
          min={effectiveMin}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full bg-transparent text-xs sm:text-sm font-semibold outline-none cursor-pointer ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
          style={{
            colorScheme: isDark ? 'dark' : 'light',
          }}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-semibold text-rose-500 animate-fade-in">{error}</p>
      ) : helperText ? (
        <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {helperText}
        </p>
      ) : !allowPast ? (
        <p className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Solo fechas desde el día actual en adelante
        </p>
      ) : null}
    </div>
  );
}
