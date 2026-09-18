import React from 'react';
import { FiBell, FiMenu, FiSearch } from 'react-icons/fi';

export default function Header({
  title,
  subtitle,
  badgeText,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  userName = 'Usuario',
  userInitials = 'EH',
  showSearch = false,
  onMenuToggle,
  className = '',
}) {
  return (
    <header className={`flex h-[72px] shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 sm:px-8 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Abrir menú de navegación"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
          >
            <FiMenu size={20} />
          </button>
        )}

        <div className="min-w-0">
          {badgeText && (
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#087fea] bg-[#e8f2ff] px-2 py-0.5 rounded-md inline-block mb-1">
              {badgeText}
            </span>
          )}
          {title && (
            <h1 className="font-display text-[16px] sm:text-[20px] font-bold text-[#172033] leading-tight truncate">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-xs text-[#64748b] mt-0.5 truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {showSearch && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 shadow-sm rounded-full px-3 py-1.5 text-sm text-[#64748b] focus-within:bg-white focus-within:border-[#087fea] focus-within:ring-2 focus-within:ring-[#087fea]/10 transition-all">
            <FiSearch size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-[#172033] placeholder-slate-400 text-xs sm:text-sm w-28 sm:w-44 md:w-56"
            />
          </div>
        )}

        <button
          type="button"
          aria-label="Notificaciones"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-[#222936] hover:text-[#087fea] hover:border-[#087fea] shadow-sm transition-colors"
        >
          <FiBell size={16} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#168bf3]" />
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Abrir perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087fea] text-xs font-semibold text-white shadow-sm shrink-0"
          >
            {userInitials}
          </button>
          {userName && (
            <span className="hidden lg:inline-block text-xs font-semibold text-[#172033] max-w-[140px] truncate">
              {userName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
