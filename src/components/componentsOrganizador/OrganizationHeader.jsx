import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiUser,
} from 'react-icons/fi';
import { session, extractPhotoUrl } from '../../services/session.js';
import userService from '../../services/userService.js';
import DashboardNotifications from '../common/DashboardNotifications.jsx';

/**
 * OrganizationHeader
 * Barra superior contemporánea para el Centro de Operaciones del Organizador.
 * Integra título editorial, estado de producción, notificaciones asíncronas en tiempo real y menú de usuario.
 */
export default function OrganizationHeader({
  title = 'Centro de Operaciones',
  subtitle,
  userName = 'Organización',
  userInitials = 'EH',
  userPhoto = null,
  onMenuToggle,
  onProfileClick,
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sessionUser, setSessionUser] = useState(() => session.getUser());
  const [photoError, setPhotoError] = useState(false);

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

  useEffect(() => {
    const token = session.getToken();
    if (!token || session.isDevSession()) return;
    userService.getPerfil().catch(() => {});
  }, []);

  const displayPhoto = extractPhotoUrl(sessionUser) || userPhoto || null;

  useEffect(() => {
    setPhotoError(false);
  }, [displayPhoto]);

  // Cerrar dropdown al hacer clic fuera o con Escape
  useEffect(() => {
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    session.clear();
    navigate('/iniciosesion');
  };

  const showValidPhoto = Boolean(displayPhoto && !photoError);

  return (
    <header className="sticky top-0 z-30 h-[72px] w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Lado izquierdo: Botón Menú Móvil + Jerarquía Editorial */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menú de navegación"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
        >
          <FiMenu size={20} />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2 py-0.5 rounded-md">
              Cartagena Cultural HQ
            </span>
            <span className="hidden sm:inline-block text-slate-300">•</span>
            <h1 className="font-display text-sm sm:text-base font-extrabold text-slate-900 truncate tracking-tight">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Lado derecho: Notificaciones Asíncronas Estándar + Perfil */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Notificaciones Asíncronas Estandarizadas */}
        <DashboardNotifications />

        {/* Separador */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Dropdown de Organización y Perfil */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs group"
          >
            {showValidPhoto ? (
              <img
                key={displayPhoto}
                src={displayPhoto}
                alt={userName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left min-w-0 pr-1">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[130px] leading-tight">
                {userName}
              </span>
              <span className="text-[10px] font-medium text-slate-500 leading-none">
                Organizador
              </span>
            </div>
            <FiChevronDown
              size={14}
              className={`text-slate-400 group-hover:text-slate-700 transition-transform hidden sm:block ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menú Flotante de Perfil */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
              <div className="px-4 py-2.5">
                <p className="text-xs font-extrabold text-slate-900 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {session.getUser()?.email || 'Cuenta de Organización'}
                </p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    if (onProfileClick) onProfileClick();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <FiUser size={14} className="text-slate-400" />
                  <span>Mi perfil de organización</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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
