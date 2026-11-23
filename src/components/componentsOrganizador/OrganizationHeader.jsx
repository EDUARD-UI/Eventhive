import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
 * OrganizationHeader — Editorial
 * Topbar arquitectónico (height: 56px móvil / 64px escritorio), fondo #FFFFFF y borde inferior 1px solid #E2E8F0.
 * En móvil y tablet (< 1024px) muestra botón hamburguesa minimalista, isotipo y nombre "Event Hive".
 * En escritorio permite ocultar y volver a mostrar la barra lateral.
 * Breadcrumb editorial limpio con la sección actual y selector de organización/perfil.
 */
export default function OrganizationHeader({
  title = 'Resumen',
  subtitle,
  userName = '',
  userInitials = 'EH',
  userPhoto = null,
  userRole = 'Organizador',
  onMenuToggle,
  onProfileClick,
  desktopSidebarOpen = true,
  onToggleDesktopSidebar = () => {},
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sessionUser, setSessionUser] = useState(() => session.getUser());
  const [photoError, setPhotoError] = useState(false);

  // Nombre resuelto del usuario autenticado
  const effectiveUserName =
    userName && userName !== 'Organización'
      ? userName
      : sessionUser?.name ||
        sessionUser?.nombre ||
        sessionUser?.username ||
        sessionUser?.email?.split('@')[0] ||
        (userRole === 'Organización' ? 'Organización' : 'Usuario');

  const effectiveInitials =
    effectiveUserName && effectiveUserName !== 'Usuario'
      ? effectiveUserName
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
      : userInitials || 'EH';

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
  const cleanTitle = (title || 'Resumen').toUpperCase();

  // Texto contextual de la opción de perfil según el rol
  const getProfileLabel = () => {
    const r = String(userRole || '').toUpperCase();
    if (r.includes('MODERAD')) return 'Mi Perfil de Moderación';
    if (r.includes('MARKETING')) return 'Mi Perfil de Difusión';
    if (r.includes('ADMIN')) return 'Mi Perfil de Administrador';
    if (r.includes('OPERADOR')) return 'Mi Perfil Operativo';
    return 'Perfil de Organización';
  };

  const handleProfileNavigation = () => {
    setDropdownOpen(false);
    if (onProfileClick) {
      onProfileClick();
      return;
    }
    const r = String(userRole || '').toUpperCase();
    if (r.includes('MODERAD')) {
      navigate('/moderador?tab=perfil');
    } else if (r.includes('MARKETING')) {
      navigate('/marketing?tab=perfil');
    } else if (r.includes('ADMIN')) {
      navigate('/admin');
    } else {
      navigate('/organizacion');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[56px] lg:h-[64px] w-full border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 select-none">
      {/* Lado izquierdo: Botón Menú Móvil + Nombre de Sección del Panel */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 sm:flex-initial">
        {/* Botón hamburguesa minimalista móvil (< 1024px) */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menú de navegación"
          className="p-1.5 sm:p-2 rounded-[2px] text-[#0F2342] hover:bg-[#F8F9FA] lg:hidden transition-colors cursor-pointer shrink-0"
        >
          <FiMenu size={19} strokeWidth={1.75} />
        </button>

        {/* Nombre de la sección actual en fuente monoespaciada con punto dorado de estado (en topbar nunca se repite isotipo ni marca) */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] sm:text-xs font-bold tracking-widest text-[#0F2342] uppercase truncate">
            {cleanTitle}
          </span>
        </div>
      </div>

      {/* Lado derecho: Notificación Minimalista + Selector de Organización / Perfil */}
      <div className="flex items-center gap-3 sm:gap-5 shrink-0">
        {/* Notificación Minimalista */}
        <div className="relative flex items-center">
          <DashboardNotifications />
        </div>

        {/* Separador sutil de 1px */}
        <div className="h-5 w-px bg-[#E2E8F0]" />

        {/* Selector de Organización / Usuario Compacto */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2.5 py-1 px-1.5 rounded-[2px] hover:bg-[#F8F9FA] transition-all cursor-pointer group"
          >
            {showValidPhoto ? (
              <img
                key={displayPhoto}
                src={displayPhoto}
                alt={effectiveUserName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#F5B800]/40 shrink-0"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0F2342] text-[#F5B800] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#F5B800]/40">
                {effectiveInitials}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left min-w-0 max-w-[140px]">
              <span className="text-xs font-bold text-[#0F2342] truncate leading-tight font-sans">
                {effectiveUserName}
              </span>
              <span className="font-mono text-[10px] text-[#64748B] truncate leading-tight">
                {userRole}
              </span>
            </div>
            <FiChevronDown size={14} strokeWidth={1.5} className="text-[#64748B] group-hover:text-[#0F2342] transition-colors" />
          </button>

          {/* Menú desplegable */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_10px_25px_rgba(0,0,0,0.08)] py-1.5 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-bold text-[#0F2342] truncate">{effectiveUserName}</p>
                <p className="font-mono text-[10px] text-[#64748B] truncate mt-0.5">{sessionUser?.email || ''}</p>
              </div>

              <button
                type="button"
                onClick={handleProfileNavigation}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#0F2342] hover:bg-[#F8F9FA] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FiUser size={14} strokeWidth={1.5} className="text-[#64748B]" />
                <span>{getProfileLabel()}</span>
              </button>

              <div className="my-1 border-t border-[#F1F5F9]" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FiLogOut size={14} strokeWidth={1.5} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
