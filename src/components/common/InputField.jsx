import { useState } from 'react';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export default function InputField({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  touched,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
  className = '',
  helperText,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError = Boolean(touched && error);
  const isPhone = type === 'tel' || name === 'phone' || name === 'telefono';
  const isNit = name === 'nit';

  const handleInputChange = (e) => {
    if (isPhone) {
      const sanitized = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = sanitized;
    } else if (isNit) {
      e.target.value = e.target.value.slice(0, 12);
    }
    onChange?.(e);
  };

  const handleKeyDown = (e) => {
    if (isPhone) {
      const allowedKeys = [
        'Backspace', 'Tab', 'Enter', 'Escape', 'Delete',
        'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'
      ];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
      }
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }
    props.onKeyDown?.(e);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-semibold text-ink dark:text-slate-200 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3.5 text-muted pointer-events-none transition-colors">
            <Icon size={16} className={hasError ? 'text-rose-500' : 'text-slate-400'} />
          </span>
        )}

        <input
          id={id || name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          {...props}
          className={`w-full rounded-xl border text-xs sm:text-sm transition-all outline-none
            ${Icon ? 'pl-9' : 'pl-3.5'}
            ${isPassword ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${
              hasError
                ? 'border-rose-400 bg-rose-50/30 text-slate-900 placeholder:text-slate-400 dark:border-rose-500 dark:bg-rose-950/25 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : disabled
                  ? 'border-slate-200 bg-slate-100 text-slate-500 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:placeholder:text-slate-500'
                  : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 hover:border-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 focus:bg-white dark:border-slate-700 dark:bg-[#070D1B] dark:text-slate-100 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:bg-[#0B132B]'
            }
            ${disabled ? 'cursor-not-allowed opacity-75' : ''}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>

      {hasError ? (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600 font-medium">
          <FiAlertCircle size={13} className="shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
