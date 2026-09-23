import React from 'react';

export default function StatCard({
  label,
  value,
  change,
  icon: IconOrElement,
  iconBg = 'bg-brand-light',
  iconColor = 'text-brand',
  color, // compatibilidad con llamadas que pasen `color`
  trend = 'up',
  subtitle,
  className = '',
}) {
  const bgClass = color || iconBg;

  // Manejo flexible de si icon es un componente (FiUsers) o un JSX (<FiUsers />)
  const renderIcon = () => {
    if (!IconOrElement) return null;
    if (React.isValidElement(IconOrElement)) {
      return IconOrElement;
    }
    const Comp = IconOrElement;
    return <Comp size={20} />;
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/85 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      {/* Fondo con brillo sutil decorativo en hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand/5 rounded-full blur-2xl group-hover:bg-brand/10 transition-colors pointer-events-none" />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>

        {IconOrElement && (
          <div
            className={`w-11 h-11 rounded-xl ${bgClass} ${iconColor} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
          >
            {renderIcon()}
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <span
              className={`inline-flex items-center gap-1 font-bold text-[11px] px-2 py-0.5 rounded-md ${
                trend === 'down'
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              <span>{trend === 'down' ? '↓' : '↑'}</span>
              <span>{change}</span>
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-slate-400 font-medium">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
