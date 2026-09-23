import React from 'react';
import { FiGrid, FiList } from 'react-icons/fi';

export default function ViewToggle({
  viewMode = 'grid',
  onViewChange,
  className = '',
}) {
  return (
    <div
      role="group"
      aria-label="Selector de vista"
      className={`inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner ${className}`}
    >
      <button
        type="button"
        onClick={() => onViewChange && onViewChange('grid')}
        aria-pressed={viewMode === 'grid'}
        title="Vista en Tarjetas (Grid)"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
          viewMode === 'grid'
            ? 'bg-white text-brand shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FiGrid size={15} />
        <span className="hidden sm:inline">Tarjetas</span>
      </button>

      <button
        type="button"
        onClick={() => onViewChange && onViewChange('table')}
        aria-pressed={viewMode === 'table'}
        title="Vista en Tabla (Table)"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
          viewMode === 'table'
            ? 'bg-white text-brand shadow-sm font-bold'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FiList size={15} />
        <span className="hidden sm:inline">Tabla</span>
      </button>
    </div>
  );
}
