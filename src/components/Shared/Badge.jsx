import React from 'react';

const TONES = {
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  draft: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  amber: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  warning: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  primary: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  info: 'bg-sky-50 text-sky-700 border border-sky-200/80',
  red: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  purple: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  finished: 'bg-slate-100 text-slate-600 border border-slate-200/80',
  neutral: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200/80',
};

const SIZES = {
  xs: 'text-[10px] px-2 py-0.5 font-bold',
  sm: 'text-xs px-2.5 py-0.5 font-semibold',
  md: 'text-xs px-3 py-1 font-bold',
};

export default function Badge({
  children,
  tone,
  variant,
  size = 'sm',
  className = '',
  title,
}) {
  const resolvedKey = (variant || tone || 'neutral').toLowerCase();
  const toneClass = TONES[resolvedKey] || TONES.neutral;
  const sizeClass = SIZES[size] || SIZES.sm;

  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-full leading-none tracking-wide select-none ${sizeClass} ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
