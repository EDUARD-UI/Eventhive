import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiSearch, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { session } from '../../services/session.js';

export default function Header({
  title,
  subtitle,
  badgeText,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  userName = 'Usuario',
  userInitials = 'EH',
  userEmail,
  showSearch = false,
  showNotifications = true,
  onMenuToggle,
  className = '',
  profilePath = '/perfil',
  onProfileClick,
  onLogout,
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Obtener datos de sesión para complementar email/nombre si existen
  const sessionUser = session.getUser();
  const displayEmail = userEmail || sessionUser?.email || 'Sesión activa';

  // Manejador de clics fuera del dropdown y tecla Escape
  useEffect(() => {
    if (!dropdownOpen) return;

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  // Manejador para Ver Perfil
  const handleProfile = () => {
    setDropdownOpen(false);
    if (onProfileClick) {
      onProfileClick();
    } else {
      navigate(profilePath || '/perfil');
    }
  };

  // Manejador para Cerrar Sesión
  const handleLogout = () => {
    setDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      session.clear();
      navigate('/iniciosesion');
    }
  };

  return (
    <header className={`flex h-[72px] shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 sm:px-8 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Abrir menú de navegación"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 active:scale-95 transition-all"
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

        {showNotifications && (
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-[#222936] hover:text-[#087fea] hover:border-[#087fea] shadow-sm transition-colors"
          >
            <FiBell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#168bf3]" />
          </button>
        )}

        {/* Dropdown del Avatar del Usuario */}
        <div ref={dropdownRef} className="relative flex items-center">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-full p-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#087fea]/30 transition-all"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087fea] text-xs font-bold text-white shadow-sm ring-2 ring-white hover:bg-[#076ecb] transition-colors shrink-0">
              {userInitials}
            </span>
            {userName && (
              <span className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-[#172033] max-w-[140px] truncate text-left">
                <span className="truncate">{userName}</span>
                <FiChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-[#087fea]' : ''
                  }`}
                />
              </span>
            )}
          </button>

          {/* Menú emergente (Dropdown) */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2.5 w-60 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-2 shadow-lg shadow-slate-200/80 border border-slate-200/80 z-50 animate-in fade-in zoom-in-95 duration-150"
              role="menu"
              aria-orientation="vertical"
            >
              {/* Información rápida del usuario */}
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {displayEmail}
                </p>
              </div>

              {/* Opción: Ver perfil */}
              <button
                type="button"
                role="menuitem"
                onClick={handleProfile}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#087fea] hover:bg-[#087fea]/10 rounded-xl transition-all text-left group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 group-hover:bg-[#087fea]/15 text-slate-500 group-hover:text-[#087fea] transition-colors shrink-0">
                  <FiUser size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">Ver perfil</p>
                  <p className="text-[10px] text-slate-400 truncate">Información de tu cuenta</p>
                </div>
              </button>

              <div className="h-px bg-slate-100 my-1" />

              {/* Opción: Cerrar sesión */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-left group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 group-hover:bg-rose-100 text-rose-600 transition-colors shrink-0">
                  <FiLogOut size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight">Cerrar sesión</p>
                  <p className="text-[10px] text-rose-400 truncate">Finalizar sesión activa</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
