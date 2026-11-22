import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronDown,
  FiLogOut,
  FiMenu,
  FiUser,
  FiBell,
} from 'react-icons/fi';
import { session, extractPhotoUrl } from '../../services/session.js';
import userService from '../../services/userService.js';
import DashboardNotifications from '../common/DashboardNotifications.jsx';

/**
 * OrganizationHeader — Editorial
 * Topbar arquitectónico de 64px alto, fondo #FFFFFF y borde inferior 1px solid #E2E8F0.
 * Breadcrumb editorial limpio: únicamente el nombre de la sección actual en monoespaciado.
 * Selector de organización compacto con avatar a todo color natural.
 */
export default function OrganizationHeader({
  title = 'Resumen',
  subtitle,
  userName = 'Organización',
  userInitials = 'EH',
  userPhoto = null,
  userRole = 'Organizador',
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

  return (
    <header className="sticky top-0 z-30 h-[64px] w-full border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-8 flex items-center justify-between gap-4 select-none">
      {/* Lado izquierdo: Botón Menú Móvil + Nombre de Sección en Monospace Limpio */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="Abrir menú de navegación"
          className="p-2 rounded-[2px] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] md:hidden transition-colors cursor-pointer"
        >
          <FiMenu size={18} strokeWidth={1.5} />
        </button>

        {/* Nombre de la sección actual en fuente monoespaciada con punto dorado de estado */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs font-bold tracking-widest text-[#0F2342] uppercase truncate">
            {cleanTitle}
          </span>
        </div>
      </div>

      {/* Lado derecho: Notificación Minimalista + Selector de Organización */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Notificación Minimalista con punto ámbar (#F5B800) */}
        <div className="relative flex items-center">
          <DashboardNotifications />
        </div>

        {/* Separador sutil de 1px */}
        <div className="h-5 w-px bg-[#E2E8F0]" />

        {/* Selector de Organización Compacto */}
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
                alt={userName}
                className="w-8 h-8 rounded-full object-cover border border-[#F5B800]/40 shrink-0"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0F2342] text-[#F5B800] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#F5B800]/40">
                {userInitials}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left min-w-0 max-w-[140px]">
              <span className="text-xs font-bold text-[#0F2342] truncate leading-tight font-sans">
                {userName}
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
                <p className="text-xs font-bold text-[#0F2342] truncate">{userName}</p>
                <p className="font-mono text-[10px] text-[#64748B] truncate mt-0.5">{sessionUser?.email || ''}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  if (onProfileClick) onProfileClick();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#0F2342] hover:bg-[#F8F9FA] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                <FiUser size={14} strokeWidth={1.5} className="text-[#64748B]" />
                <span>{userRole === 'Marketing' ? 'Mi Perfil' : 'Perfil de Organización'}</span>
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
