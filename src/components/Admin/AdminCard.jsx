import React from 'react';

export default function AdminCard({ children, className = '', title, subtitle, action }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-[#131b2e] p-6 shadow-md ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="font-display font-semibold text-base text-white">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
