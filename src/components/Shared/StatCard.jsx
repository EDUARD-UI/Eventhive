import React from 'react';

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg = 'bg-brand-light',
  iconColor = 'text-brand',
  trend = 'up',
  className = '',
}) {
  return (
    <div
      className={`rounded-[13px] border border-[#e0e6ed] bg-white p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 ${className}`}
    >
      {Icon && (
        <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-3`}>
          <Icon size={18} />
        </div>
      )}
      <p className="text-[11px] font-medium uppercase tracking-wider text-[#6e819b]">{label}</p>
      <p className="mt-1 font-display text-[22px] font-bold leading-7 text-[#172033]">{value}</p>
      {change && (
        <p className={`mt-1.5 flex items-center text-[10px] font-semibold ${trend === 'down' ? 'text-rose-600' : 'text-[#16bd63]'}`}>
          <span className="mr-1">{trend === 'down' ? '↓' : '↑'}</span>
          {change}
        </p>
      )}
    </div>
  );
}
