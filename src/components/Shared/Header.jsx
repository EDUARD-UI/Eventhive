import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { session } from '../../services/session.js';
import userService from '../../services/userService.js';
import DashboardNotifications from '../common/DashboardNotifications.jsx';

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
  userPhoto,
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
  const [sessionUser, setSessionUser] = useState(() => session.getUser());
  const [photoError, setPhotoError] = useState(false);

  // Escuchar actualizaciones de sesión en tiempo real (foto de perfil, nombre, rol)
  useEffect(() => {
    const handleSessionUpdated = (e) => {
      const updated = e?.detail || session.getUser();
      setSessionUser(updated ? { ...updated } : null);
      setPhotoError(false);
    };

    window.addEventListener('eventhive_session_updated', handleSessionUpdated);
    window.addEventListener('storage', handleSessionUpdated);
    return () => {
      window.removeEventListener('eventhive_session_updated', handleSessionUpdated);
      window.removeEventListener('storage', handleSessionUpdated);
    };
  }, []);

  // Sincronizar foto y nombre del perfil desde el backend al montar el Header si hay sesión activa
  useEffect(() => {
    const token = session.getToken();
    if (!token || session.isDevSession()) return;
    userService.getPerfil().catch(() => {});
  }, []);

  // Obtener datos de sesión para complementar email/nombre/foto si existen
  const displayName = sessionUser?.name || sessionUser?.nombre || userName || 'Usuario';
  const displayInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() ||
    userInitials ||
    'EH';
  const displayEmail = userEmail || sessionUser?.email || 'Sesión activa';
  const displayPhoto =
    sessionUser?.urlImagenPerfil ||
    sessionUser?.imagenPerfil ||
    sessionUser?.fotoUrl ||
    sessionUser?.foto ||
    sessionUser?.avatar ||
    userPhoto ||
    sessionUser?.urlLogo ||
    sessionUser?.logo ||
    sessionUser?.imagenUrl ||
    sessionUser?.imagen ||
    null;

  useEffect(() => {
    setPhotoError(false);
  }, [displayPhoto]);

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

  const showValidPhoto = Boolean(displayPhoto && !photoError);

  return (
    <header className={`flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 sm:px-8 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            aria-label="Abrir menú de navegación"
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 active:scale-95 transition-all cursor-pointer"
          >
            <FiMenu size={20} />
          </button>
        )}

        <div className="min-w-0">
          {title && (
            <div className="min-w-0">
              <h1 className="truncate font-display text-[16px] font-black leading-tight text-slate-900 sm:text-[20px]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-0.5 hidden max-w-[min(60vw,36rem)] truncate text-[11px] font-medium leading-tight text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {showSearch && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 shadow-2xs rounded-xl px-3 py-2 text-sm text-slate-500 focus-within:bg-white focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <FiSearch size={15} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 text-xs sm:text-sm w-28 sm:w-44 md:w-56"
            />
          </div>
        )}

        {/* Notificaciones Asíncronas Estandarizadas */}
        {showNotifications && (
          <DashboardNotifications />
        )}

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Dropdown del Avatar del Usuario */}
        <div ref={dropdownRef} className="relative flex items-center">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Menú de usuario"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-xl p-1 pl-1.5 border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 shadow-2xs transition-all cursor-pointer group"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1B3D] text-xs font-black text-amber-300 shadow-2xs shrink-0 overflow-hidden">
              {showValidPhoto ? (
                <img
                  key={displayPhoto}
                  src={displayPhoto}
                  alt={displayName}
                  className="w-full h-full object-cover object-center"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center font-display font-black text-xs">
                  {displayInitials}
                </span>
              )}
            </div>
            {displayName && (
              <span className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-800 max-w-[140px] truncate text-left">
                <span className="truncate">{displayName}</span>
                <FiChevronDown
                  size={14}
                  className={`text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </span>
            )}
          </button>

          {/* Menú emergente (Dropdown) */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-2 shadow-xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100"
              role="menu"
              aria-orientation="vertical"
            >
              {/* Información rápida del usuario */}
              <div className="px-3 py-2.5 mb-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0B1B3D] text-amber-300 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                  {showValidPhoto ? (
                    <img
                      key={displayPhoto}
                      src={displayPhoto}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={() => setPhotoError(true)}
                    />
                  ) : (
                    displayInitials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900 truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>
              </div>

              {/* Opción: Ver perfil */}
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleProfile}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all text-left cursor-pointer"
                >
                  <FiUser size={14} className="text-slate-400" />
                  <span>Ver mi perfil</span>
                </button>
              </div>

              {/* Opción: Cerrar sesión */}
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all text-left cursor-pointer"
                >
                  <FiLogOut size={14} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
