import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMenu, FiSearch, FiUser, FiLogOut, FiChevronDown, FiCheck, FiTrash2, FiClock } from 'react-icons/fi';
import { session } from '../../services/session.js';
import notificationService from '../../services/notificationService.js';

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

  // Estados de Notificaciones (Requisito 11)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notificationsRef = useRef(null);

  // Cargar notificaciones al montar y periódicamente
  useEffect(() => {
    let isMounted = true;
    async function fetchNotifs() {
      try {
        const [list, count] = await Promise.allSettled([
          notificationService.getNotificaciones(),
          notificationService.getNoLeidasCount(),
        ]);
        if (!isMounted) return;
        if (list.status === 'fulfilled') {
          setNotifications(list.value);
        }
        if (count.status === 'fulfilled') {
          setUnreadCount(count.value);
        }
      } catch (e) {
        console.warn('Error cargando notificaciones:', e);
      }
    }

    if (showNotifications) {
      fetchNotifs();
    }

    return () => {
      isMounted = false;
    };
  }, [showNotifications]);

  // Manejar clics fuera de notificaciones
  useEffect(() => {
    if (!notificationsOpen) return;

    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
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
  }, [notificationsOpen]);

  const handleToggleNotifications = async () => {
    const nextState = !notificationsOpen;
    setNotificationsOpen(nextState);
    if (nextState) {
      setDropdownOpen(false);
      try {
        setNotificationsLoading(true);
        const [list, count] = await Promise.allSettled([
          notificationService.getNotificaciones(),
          notificationService.getNoLeidasCount(),
        ]);
        if (list.status === 'fulfilled') setNotifications(list.value);
        if (count.status === 'fulfilled') setUnreadCount(count.value);
      } finally {
        setNotificationsLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    await notificationService.marcarComoLeida(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleClearRead = async () => {
    await notificationService.limpiarLeidas();
    setNotifications((prev) => prev.filter((n) => !n.leida));
  };

  // Obtener datos de sesión para complementar email/nombre/foto si existen
  const sessionUser = session.getUser();
  const displayEmail = userEmail || sessionUser?.email || 'Sesión activa';
  const displayPhoto =
    userPhoto ||
    sessionUser?.urlImagenPerfil ||
    sessionUser?.imagenPerfil ||
    sessionUser?.urlLogo ||
    sessionUser?.logo ||
    sessionUser?.fotoUrl ||
    sessionUser?.foto ||
    sessionUser?.imagenUrl ||
    sessionUser?.imagen ||
    null;

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
          <div ref={notificationsRef} className="relative flex items-center">
            <button
              type="button"
              onClick={handleToggleNotifications}
              aria-label="Notificaciones"
              aria-expanded={notificationsOpen}
              className={`relative flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all ${
                notificationsOpen
                  ? 'border-[#087fea] bg-blue-50/50 text-[#087fea]'
                  : 'border-slate-200/80 bg-white text-[#222936] hover:text-[#087fea] hover:border-[#087fea]'
              }`}
            >
              <FiBell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#087fea] text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Panel de Notificaciones Desplegable (Requisito 11) */}
            {notificationsOpen && (
              <div
                className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-3 shadow-2xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="region"
                aria-label="Panel de notificaciones"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-xs text-slate-900">
                      Notificaciones
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {unreadCount} nuevas
                      </span>
                    )}
                  </div>

                  {notifications.some((n) => n.leida) && (
                    <button
                      type="button"
                      onClick={handleClearRead}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      title="Eliminar notificaciones leídas"
                    >
                      <FiTrash2 size={12} />
                      <span>Limpiar leídas</span>
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                  {notificationsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Cargando notificaciones...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No tienes notificaciones recibidas.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.leida;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => isUnread && handleMarkAsRead(notif.id)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                            isUnread
                              ? 'bg-blue-50/70 hover:bg-blue-50 border border-blue-100'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                {isUnread && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#087fea] shrink-0" />
                                )}
                                <p className={`text-xs font-bold truncate ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {notif.titulo}
                                </p>
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                                {notif.mensaje}
                              </p>
                              {notif.nombreEvento && (
                                <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                                  {notif.nombreEvento}
                                </span>
                              )}
                            </div>

                            {isUnread && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notif.id);
                                }}
                                className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                                title="Marcar como leída"
                              >
                                <FiCheck size={13} />
                              </button>
                            )}
                          </div>

                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <FiClock size={10} />
                              <span>{notif.fechaCreacion ? notif.fechaCreacion.replace('T', ' ').slice(0, 16) : 'Reciente'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
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
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#087fea] text-xs font-bold text-white shadow-sm ring-2 ring-white hover:bg-[#076ecb] transition-colors shrink-0 overflow-hidden">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt={userName}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextSibling) {
                      e.currentTarget.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <span
                style={{ display: displayPhoto ? 'none' : 'flex' }}
                className="w-full h-full items-center justify-center"
              >
                {userInitials}
              </span>
            </div>
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
              <div className="px-3 py-2.5 border-b border-slate-100 mb-1 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#087fea] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-slate-200">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {displayEmail}
                  </p>
                </div>
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
