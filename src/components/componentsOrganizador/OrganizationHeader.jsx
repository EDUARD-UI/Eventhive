import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiLogOut,
  FiMenu,
  FiTrash2,
  FiUser,
  FiZap,
} from 'react-icons/fi';
import { session } from '../../services/session.js';
import notificationService from '../../services/notificationService.js';

/**
 * OrganizationHeader
 * Barra superior contemporánea para el Centro de Operaciones del Organizador.
 * Integra título editorial, estado de producción, notificaciones en tiempo real y menú de usuario.
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

  // Estados de Notificaciones
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notificationsRef = useRef(null);

  const fetchNotifs = async () => {
    try {
      const [list, count] = await Promise.allSettled([
        notificationService.getNotificaciones(),
        notificationService.getNoLeidasCount(),
      ]);
      if (list.status === 'fulfilled') {
        setNotifications(list.value);
      }
      if (count.status === 'fulfilled') {
        setUnreadCount(count.value);
      }
    } catch (e) {
      console.warn('Error al obtener notificaciones:', e);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  // Cerrar dropdowns al hacer clic fuera o con Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleNotifications = async () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    if (nextState) {
      setDropdownOpen(false);
      setLoadingNotifs(true);
      await fetchNotifs();
      setLoadingNotifs(false);
    }
  };

  const handleMarcarLeida = async (id) => {
    await notificationService.marcarComoLeida(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleLimpiarLeidas = async () => {
    await notificationService.limpiarLeidas();
    setNotifications((prev) => prev.filter((n) => !n.leida));
  };

  const handleLogout = () => {
    session.clear();
    navigate('/iniciosesion');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
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

      {/* Lado derecho: Notificaciones + Perfil */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Notificaciones */}
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
            title="Centro de notificaciones"
            className="relative p-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <FiBell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-black text-[9px] shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Menú Flotante de Notificaciones */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xs font-bold text-slate-900">
                    Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-slate-950">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                {notifications.some((n) => n.leida) && (
                  <button
                    type="button"
                    onClick={handleLimpiarLeidas}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <FiTrash2 size={11} /> Limpiar leídas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {loadingNotifs ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Cargando avisos...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No tienes notificaciones pendientes.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        notif.leida ? 'bg-white' : 'bg-amber-50/40 hover:bg-amber-50/70'
                      }`}
                    >
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                        <FiClock size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug">
                          {notif.titulo || 'Actualización de EventHive'}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          {notif.mensaje || notif.contenido}
                        </p>
                      </div>
                      {!notif.leida && (
                        <button
                          type="button"
                          onClick={() => handleMarcarLeida(notif.id)}
                          title="Marcar como leída"
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <FiCheck size={13} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-[#0B1B3D] text-amber-300 font-display font-black text-xs flex items-center justify-center shrink-0">
                {userInitials}
              </div>
            )}

            <div className="hidden sm:flex flex-col text-left pr-1 max-w-[140px]">
              <span className="text-xs font-bold text-slate-900 truncate leading-tight group-hover:text-amber-600 transition-colors">
                {userName}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
                Organizador
              </span>
            </div>

            <FiChevronDown
              size={13}
              className={`text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Menú Desplegable */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  Organización en EventHive
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  if (onProfileClick) onProfileClick();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <FiUser size={14} className="text-slate-400" />
                <span>Perfil de Organización</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer mt-0.5"
              >
                <FiLogOut size={14} className="text-rose-500" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

