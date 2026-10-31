import React from 'react';

export function ProfileCard({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function ProfileField({ label, children, className = '' }) {
  return (
    <div className={`min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-4 ${className}`}>
      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </span>
      <div className="mt-1.5 break-words text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}

export function ProfileMetric({ icon: Icon, label, value, detail, className = '' }) {
  return (
    <ProfileCard className={`flex min-w-0 items-center justify-between gap-4 p-5 ${className}`}>
      <div className="min-w-0">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <p className="mt-1 break-words font-display text-xl font-bold leading-tight text-slate-900 sm:text-2xl">
          {value}
        </p>
        {detail && <span className="mt-1 block text-[11px] text-slate-500">{detail}</span>}
      </div>
      {Icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
    </ProfileCard>
  );
}
