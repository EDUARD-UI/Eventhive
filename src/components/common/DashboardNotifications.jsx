import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiLoader,
  FiTrash2,
} from 'react-icons/fi';
import notificationService from '../../services/notificationService.js';
import { showNotificationReadToast } from '../../utils/alertUtils.js';

/**
 * DashboardNotifications — Popover Editorial
 * Rediseño minimalista estilo bitácora de producción:
 * - Superficie #FFFFFF, borde 1px solid #E2E8F0, border-radius: 2px.
 * - Sin círculos amarillos ni campanas redundantes.
 * - Barra lateral izquierda de 3px (#F5B800 en no leídas) y punto de 6px.
 * - Badge de campana en el topbar con punto sólido de 7px en #F5B800.
 */
export default function DashboardNotifications({
  className = '',
  buttonClassName = '',
  customTrigger = null,
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

  // Polling y sincronización
  useEffect(() => {
    fetchNotificationsData(true);

    const intervalId = setInterval(() => {
      fetchNotificationsData(true);
    }, 20000);

    const handleWindowFocus = () => {
      fetchNotificationsData(true);
    };
    window.addEventListener('focus', handleWindowFocus);

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

  // Manejo de clic afuera y escape
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
      showNotificationReadToast();
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.leida);
      await Promise.allSettled(unreadList.map((n) => notificationService.marcarComoLeida(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
      showNotificationReadToast();
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error marking all as read:', err);
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationService.limpiarLeidas();
      setNotifications((prev) => prev.filter((n) => !n.leida));
      showNotificationReadToast();
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error clearing read notifications:', err);
    }
  };

  const handleDeleteOne = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.eliminarNotificacion(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      window.dispatchEvent(new CustomEvent('eventhive_notifications_refresh'));
    } catch (err) {
      console.warn('Error deleting notification:', err);
    }
  };

  const hasReadNotifications = notifications.some((n) => n.leida);

  const formatNotifDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      const day = d.getDate();
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const month = months[d.getMonth()] || 'MES';
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${day} ${month} • ${formattedHours}:${minutes} ${ampm}`;
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Botón disparador de campana */}
      {customTrigger ? (
        <div onClick={handleToggle}>
          {customTrigger}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} no leídas)` : ''}`}
          aria-expanded={isOpen}
          title="Centro de notificaciones"
          className={`relative flex h-9 w-9 items-center justify-center rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#0F2342] hover:bg-[#F8F9FA] transition-all cursor-pointer ${buttonClassName}`}
        >
          <FiBell size={16} strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-[#F5B800] ring-2 ring-white"
              aria-hidden="true"
            />
          )}
        </button>
      )}

      {/* Popover desplegable — Estilo Bitácora Editorial */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] max-w-[92vw] rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] shadow-[0_12px_32px_rgba(15,35,66,0.08)] z-50 animate-in fade-in zoom-in-95 duration-100 select-none">
          {/* Cabecera del Popover */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-3.5 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xs text-[#0F2342] tracking-wider uppercase">
                Notificaciones
              </span>
              {unreadCount > 0 ? (
                <span className="font-mono text-[10px] text-[#D97706] font-bold tracking-wider">
                  ({unreadCount} NUEVAS)
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="font-mono text-[10px] text-[#0F2342] hover:text-[#B45309] border-b border-transparent hover:border-[#F5B800] transition-colors cursor-pointer"
                >
                  Marcar todas
                </button>
              )}

              {hasReadNotifications && (
                <button
                  type="button"
                  onClick={handleClearRead}
                  className="font-mono text-[10px] text-[#DC2626] hover:text-[#991B1B] border-b border-transparent hover:border-[#DC2626] transition-colors flex items-center gap-1 cursor-pointer"
                  title="Eliminar todas las notificaciones ya leídas"
                >
                  <FiTrash2 size={10} />
                  <span>Eliminar leídas</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de Notificaciones (Filas de Bitácora con filete 1px y barra lateral de 3px) */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E2E8F0]">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-[#64748B]">
                <FiLoader size={18} className="animate-spin mx-auto mb-2 text-[#0F2342]" />
                <p>SINCRONIZANDO BITÁCORA...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-[#64748B]">
                <FiCheckCircle size={22} className="mx-auto mb-2 text-[#0F2342]" />
                <p className="font-display font-black text-xs text-[#0F2342] uppercase">
                  Bitácora al día
                </p>
                <p className="font-mono text-[11px] text-[#64748B] mt-0.5">
                  No hay avisos pendientes en tu consola.
                </p>
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
                    className={`relative p-4 transition-colors cursor-pointer flex flex-col gap-1.5 hover:bg-[#F8F9FA] ${
                      isUnread ? 'bg-[#FFFFFF]' : 'bg-[#FAFAFA]'
                    }`}
                  >
                    {/* Barra lateral izquierda de 3px: #F5B800 si no leída, transparente si leída */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[3px]"
                      style={{ backgroundColor: isUnread ? '#F5B800' : 'transparent' }}
                      aria-hidden="true"
                    />

                    {/* Título y Punto de Estado */}
                    <div className="flex items-center justify-between gap-2 pl-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isUnread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-[#F5B800] shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <h4
                          className={`text-xs truncate ${
                            isUnread
                              ? 'font-display font-black text-[#0F2342] uppercase tracking-tight'
                              : 'font-mono text-[#64748B]'
                          }`}
                        >
                          {notif.titulo || notif.title || 'Notificación oficial'}
                        </h4>
                      </div>
                    </div>

                    {/* Mensaje descriptivo */}
                    <p
                      className={`text-xs leading-relaxed pl-1 ${
                        isUnread ? 'text-[#0F2342]' : 'text-[#64748B]'
                      }`}
                    >
                      {notif.mensaje || notif.message || notif.descripcion || ''}
                    </p>

                    {/* Pie: Fecha en monoespaciado, botón marcar leída y botón eliminar */}
                    <div className="pt-1 flex items-center justify-between font-mono text-[10px] text-[#94A3B8] pl-1">
                      <span>{formatNotifDate(notif.fechaCreacion || notif.createdAt || notif.fecha)}</span>

                      <div className="flex items-center gap-2">
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-[#0F2342] hover:text-[#B45309] font-bold border-b border-transparent hover:border-[#F5B800] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FiCheck size={11} className="text-[#F5B800]" />
                            <span>Marcar leída</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteOne(notif.id, e)}
                            className="text-[#94A3B8] hover:text-[#DC2626] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Eliminar notificación de la bitácora"
                          >
                            <FiTrash2 size={11} />
                            <span>Eliminar</span>
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
