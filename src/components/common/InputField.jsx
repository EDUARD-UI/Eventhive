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
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError = Boolean(touched && error);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-semibold text-ink mb-1.5"
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
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full rounded-xl border bg-white text-sm text-ink transition-all outline-none placeholder:text-slate-400
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${isPassword ? 'pr-11' : 'pr-3.5'}
            py-2.5
            ${
              hasError
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-borderc hover:border-slate-300 focus:border-brand focus:ring-2 focus:ring-brand/15'
            }
            ${disabled ? 'bg-slate-100 opacity-60 cursor-not-allowed' : ''}
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
