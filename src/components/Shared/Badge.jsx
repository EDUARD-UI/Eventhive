import React from 'react';

/**
 * Badge
 * Componente unificado para estados y etiquetas de la plataforma.
 * Diseño estilo "círculo casi cuadrado" (rounded-lg / rounded-xl),
 * con tipografía nítida y colores semánticos (dorado ámbar, esmeralda, rose).
 * Evita tonos grises o morados en estados y categorías según guía de diseño.
 */
const TONES = {
  active: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  green: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  aprobada: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  aprobado: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  aplicado: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  exitoso: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  completado: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  publicada: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
  publicado: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',

  draft: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  borrador: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  amber: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  warning: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  pendiente: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  pendiente_revision: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  en_revision: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  en_correccion: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  category: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',

  red: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  danger: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  rose: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  rechazado: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  rechazada: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  suspendido: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  suspendida: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  cancelado: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
  cancelada: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',

  blue: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  primary: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  info: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  purple: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',

  finished: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
  slate: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
  finalizado: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
  neutral: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
  gray: 'bg-amber-500/15 text-amber-800 border border-amber-500/30 font-bold',
};

const SIZES = {
  xs: 'text-[10px] px-2 py-0.5 font-bold',
  sm: 'text-xs px-2.5 py-1 font-bold',
  md: 'text-xs px-3 py-1.5 font-bold',
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
      className={`inline-flex items-center justify-center rounded-lg leading-tight tracking-wide select-none shadow-2xs ${sizeClass} ${toneClass} ${className}`}
    >
      {children}
    </span>
  );
}
