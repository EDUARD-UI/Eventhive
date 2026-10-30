import React, { useRef, useState } from 'react';

const VARIANTS = {
  primary:
    'bg-brand text-white hover:bg-brand-dark focus-visible:ring-brand/30 border border-transparent',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-300',
  accent:
    'bg-accent text-navy-900 hover:bg-accent-dark focus-visible:ring-accent/30 border border-transparent',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/30 border border-transparent',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/30 border border-transparent',
};

export default function ActionButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loadingText,
  className = '',
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false);
  const actionLocked = useRef(false);

  const handleClick = async (event) => {
    if (actionLocked.current || disabled || isLoading) return;

    actionLocked.current = true;
    try {
      const result = onClick?.(event);
      if (!result || typeof result.then !== 'function') return;

      setIsLoading(true);
      await result;
    } finally {
      actionLocked.current = false;
      setIsLoading(false);
    }
  };

  const busy = disabled || isLoading;

  return (
    <button
      {...props}
      type={type}
      onClick={handleClick}
      disabled={busy}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
    >
      {isLoading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z"
          />
        </svg>
      )}
      {isLoading ? loadingText || children : children}
    </button>
  );
}
