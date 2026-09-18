import React from 'react';

const TONES = {
  active: 'bg-[#d9fbe8] text-[#13b962] border border-emerald-200/50',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  draft: 'bg-[#fff0d9] text-[#ed8b27] border border-amber-200/50',
  amber: 'bg-amber-50 text-amber-800 border border-amber-200',
  blue: 'bg-brand-light text-brand border border-blue-100',
  finished: 'bg-[#edf2f7] text-[#8394ab] border border-slate-200',
  gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  red: 'bg-rose-50 text-rose-700 border border-rose-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function Badge({ children, tone = 'gray', className = '' }) {
  const toneClass = TONES[tone] || TONES.gray;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
