import React from 'react';

/**
 * StatCard
 * Tarjeta de KPI unificada para Dashboards.
 * Muestra limpiamente: Logo/Icono (si usa), Título y Dato (número o texto).
 * Sin tags decorativas inferiores según especificación de diseño.
 */
export default function StatCard({
  label,
  value,
  icon: IconOrElement,
  iconBg = 'bg-amber-50',
  iconColor = 'text-amber-600',
  color, // compatibilidad con llamadas que pasen `color`
  className = '',
}) {
  // Evitar backgrounds o textos azules en los iconos de KPI
  let resolvedBg = color || iconBg;
  let resolvedColor = iconColor;

  if (resolvedBg.includes('blue') || resolvedBg.includes('brand')) {
    resolvedBg = 'bg-amber-50';
  }
  if (resolvedColor.includes('blue') || resolvedColor.includes('brand')) {
    resolvedColor = 'text-amber-600';
  }

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
      className={`group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {label}
          </p>
          <p className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </p>
        </div>

        {IconOrElement && (
          <div
            className={`w-11 h-11 rounded-xl ${resolvedBg} ${resolvedColor} border border-amber-200/40 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
          >
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
}
