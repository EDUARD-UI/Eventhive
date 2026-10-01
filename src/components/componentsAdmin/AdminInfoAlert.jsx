import React, { useState, useEffect } from 'react';
import { Info, X, HelpCircle } from 'lucide-react';

/**
 * Componente de alerta informativa para paneles del Administrador (Requisito 10).
 * - Se muestra automáticamente la primera vez que el administrador entra al panel.
 * - Puede ocultarse (persistido en localStorage para no reaparecer automáticamente).
 * - Incluye una acción explícita para volver a mostrarla cuando el usuario lo desee.
 */
export default function AdminInfoAlert({
  id,
  title,
  description,
  icon: Icon = Info,
  badgeText = 'Guía Inicial',
  children,
  className = '',
}) {
  const storageKey = `eventhive_admin_alert_dismissed_${id}`;
  const [isOpen, setIsOpen] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsOpen(false);
      }
    } catch {
      // localStorage fallback
    } finally {
      setIsInitialized(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // localStorage fallback
    }
  };

  const handleReopen = () => {
    setIsOpen(true);
  };

  if (!isInitialized) return null;

  if (!isOpen) {
    return (
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleReopen}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold text-slate-500 bg-white hover:bg-slate-50 hover:text-slate-800 border border-slate-200/80 shadow-2xs transition-all active:scale-95"
          title="Ver explicación de este módulo"
        >
          <HelpCircle className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          <span>Guía de la sección</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`relative p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/80 shadow-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 ${className}`}
      role="region"
      aria-label={title || 'Información de la sección'}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 rounded-xl bg-blue-100/80 text-blue-700 shrink-0 mt-0.5">
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>

        <div className="min-w-0 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {badgeText && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md">
                {badgeText}
              </span>
            )}
            {title && (
              <span className="font-bold text-slate-900 block">{title}</span>
            )}
          </div>
          {description && <p className="text-slate-600">{description}</p>}
          {children}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shrink-0"
        title="Ocultar esta explicación"
        aria-label="Ocultar alerta"
      >
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
