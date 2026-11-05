import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiBell,
  FiCheck,
  FiTrash2,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiCalendar,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';
import notificationService from '../../services/notificationService.js';

/**
 * DashboardNotifications
 * Componente estándar de notificaciones asíncronas para todos los dashboards de EventHive
 * (Organización, Moderador, Marketing, Administrador).
 * 
 * - Consulta asíncrona periódica (polling cada 20s) y al reenfocar la ventana.
 * - Despacha y escucha eventos para sincronización inmediata en tiempo real.
 * - Soporte para marcar como leída y limpiar leídas.
 */
export default function DashboardNotifications({
  className = '',
  buttonClassName = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Consulta asíncrona de notificaciones y conteo de no leídas
  const fetchNotificationsData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const [listResult, countResult] = await Promise.allSettled([
        notificationService.getNotificaciones(),
        notificationService.getNoLeidasCount(),
      ]);

      if (listResult.status === 'fulfilled' && Array.isArray(listResult.value)) {
        setNotifications(listResult.value);
      }
      if (countResult.status === 'fulfilled') {
        const count = typeof countResult.value === 'number' ? countResult.value : 0;
        setUnreadCount(count);
      }
    } catch (err) {
      console.warn('Error fetching notifications asynchronously:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Polling asíncrono y listeners de foco/eventos
  useEffect(() => {
    // 1. Carga inicial
    fetchNotificationsData(true);

    // 2. Polling recurrente cada 20 segundos
    const intervalId = setInterval(() => {
      fetchNotificationsData(true);
    }, 20000);

    // 3. Al reenfocar la ventana o pestaña del navegador
    const handleWindowFocus = () => {
      fetchNotificationsData(true);
    };
    window.addEventListener('focus', handleWindowFocus);

    // 4. Evento custom global para refrescar tras acciones del usuario
    const handleCustomRefresh = () => {
      fetchNotificationsData(true);
    };
    window.addEventListener('eventhive_notifications_refresh', handleCustomRefresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('eventhive_notifications_refresh', handleCustomRefresh);
    };
  }, [fetchNotificationsData]);

  // Manejo de clic afuera y tecla Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      fetchNotificationsData(false);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.marcarComoLeida(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationService.limpiarLeidas();
      setNotifications((prev) => prev.filter((n) => !n.leida));
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error clearing read notifications:', err);
    }
  };

  const formatNotifDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Botón de campana */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
        aria-expanded={isOpen}
        title="Centro de notificaciones"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs ${buttonClassName}`}
      >
        <FiBell size={18} className={unreadCount > 0 ? 'text-amber-500' : ''} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-xs animate-in zoom-in-50 duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover desplegable */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-w-[92vw] rounded-2xl border border-slate-200/90 bg-white p-0 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header del Popover */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-black text-slate-900">
                Notificaciones
              </span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {notifications.some((n) => n.leida) && (
              <button
                type="button"
                onClick={handleClearRead}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                title="Eliminar notificaciones ya leídas"
              >
                <FiTrash2 size={12} />
                <span>Limpiar leídas</span>
              </button>
            )}
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FiLoader size={20} className="animate-spin mx-auto mb-2 text-amber-500" />
                <p className="text-xs font-medium">Sincronizando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FiCheckCircle size={28} className="mx-auto mb-2 text-emerald-500/70" />
                <p className="text-xs font-bold text-slate-700">¡Bandeja al día!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">No tienes notificaciones pendientes.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.leida;
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(notif.id);
                    }}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-50 ${
                      isUnread ? 'bg-amber-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Icono de estado */}
                    <div
                      className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUnread
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FiBell size={14} />
                    </div>

                    {/* Texto informativo */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs leading-snug truncate ${isUnread ? 'font-black text-slate-900' : 'font-medium text-slate-700'}`}>
                          {notif.titulo || notif.title || 'Notificación del sistema'}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.mensaje || notif.message || notif.descripcion || ''}
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <FiClock size={10} />
                          <span>{formatNotifDate(notif.fechaCreacion || notif.createdAt || notif.fecha)}</span>
                        </span>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-amber-700 hover:text-amber-900 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <FiCheck size={11} />
                            <span>Leída</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

