import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCalendar,
  FiClock,
  FiEdit3,
  FiMapPin,
  FiPauseCircle,
  FiSend,
  FiLayers,
  FiRotateCcw,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiDollarSign,
  FiTag,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import { organizerService } from '../../services/organizerService.js';
import moderationService from '../../services/moderationService.js';
import { session, normalizeRole } from '../../services/session.js';
import Swal from 'sweetalert2';
import { showConfirmAlert } from '../../utils/alertUtils.js';
import { formatFecha, formatHora12, formatFechaHora12, formatPrice } from '../../utils/formatters.js';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

const customPinIcon = () =>
  L.divIcon({
    className: 'custom-moderacion-pin',
    html: `
      <div style="position: relative; width: 32px; height: 40px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.25));">
        <svg viewBox="0 0 34 42" width="32" height="40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#F59E0B" stroke="#0B1B3D" stroke-width="2"/>
          <circle cx="17" cy="17" r="5" fill="#0B1B3D"/>
          <circle cx="17" cy="17" r="2.5" fill="#FCD34D"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });

const toneMap = {
  PUBLICADO: 'active',
  FINALIZADO: 'neutral',
  BORRADOR: 'warning',
  CANCELADO: 'danger',
  SUSPENDIDO: 'danger',
  PENDIENTE_REVISION: 'warning',
  EN_CORRECCION: 'warning',
  RECHAZADO: 'danger',
};

const labelMap = {
  PUBLICADO: 'Activo',
  FINALIZADO: 'Finalizado',
  BORRADOR: 'Borrador',
  CANCELADO: 'Cancelado',
  SUSPENDIDO: 'Suspendido',
  PENDIENTE_REVISION: 'En revisión',
  EN_CORRECCION: 'En corrección',
  RECHAZADO: 'Rechazado',
};

export default function EventDetailView({
  eventId,
  event: directEvent,
  onBack,
  onClose,
  onEdit,
  isDrawer = true,
  canSendEvents = true,
  orgSuspended = false,
  readOnly = false,
  allowSuspend = true,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
  onEditBanner,
  actionLoading = false,
}) {
  const activeEventId = directEvent?.id || eventId;
  const handleClose = onBack || onClose || (() => {});

  const [event, setEvent] = useState(directEvent || null);
  const [loading, setLoading] = useState(!directEvent && Boolean(activeEventId));
  const [runningAction, setRunningAction] = useState(null); // 'review' | 'withdraw' | 'cancel' | 'reopen'
  const [historial, setHistorial] = useState([]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !runningAction && !actionLoading) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [runningAction, actionLoading, handleClose]);

  useEffect(() => {
    if (directEvent && directEvent.titulo) {
      setEvent(directEvent);
      if (directEvent.id) {
        moderationService
          .getHistorialModeracion(directEvent.id, { page: 0, size: 20 })
          .then((res) => {
            const items = Array.isArray(res) ? res : res?.content || [];
            setHistorial(items);
          })
          .catch(() => {});
      }
      return;
    }

    if (!activeEventId) return;

    let isMounted = true;
    setLoading(true);

    const currentUser = session.getUser();
    const userRole = normalizeRole(currentUser?.role || currentUser?.rol);
    const canViewModeration = ['MODERADOR', 'ADMINISTRADOR'].includes(userRole) || Boolean(onAprobar);

    const p1 = organizerService
      .getEventoDetalle(activeEventId)
      .then((data) => {
        if (isMounted && data) setEvent(data);
      })
      .catch((err) => {
        return moderationService
          .getEventoDetalle(activeEventId)
          .then((data) => {
            if (isMounted && data) setEvent(data);
          })
          .catch((e) => console.warn('Error cargando detalle de evento:', e));
      });

    const p2 = canViewModeration
      ? moderationService
          .getHistorialModeracion(activeEventId, { page: 0, size: 20 })
          .then((res) => {
            if (isMounted) {
              const items = Array.isArray(res) ? res : res?.content || [];
              setHistorial(items);
            }
          })
          .catch((err) => {
            console.warn('Historial de moderación no disponible para este usuario:', err?.message);
          })
      : Promise.resolve();

    Promise.allSettled([p1, p2]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [activeEventId, directEvent, onAprobar]);

  const handleAction = async (actionKey, actionFn, successMsg) => {
    if (runningAction) return;
    setRunningAction(actionKey);
    try {
      await actionFn();
      const updated = await organizerService.getEventoDetalle(activeEventId);
      if (updated) setEvent(updated);
      if (successMsg) {
        Swal.fire({
          icon: 'success',
          title: 'Operación realizada',
          text: successMsg,
          timer: 1600,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error al ejecutar la acción.',
      });
    } finally {
      setRunningAction(null);
    }
  };

  const renderContainer = (content) => {
    if (isDrawer) {
      const drawerNode = (
        <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => !runningAction && !actionLoading && handleClose()}
            aria-hidden="true"
          />
          <div
            data-lenis-prevent="true"
            className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
          >
            {content}
          </div>
        </div>
      );
      return typeof document !== 'undefined' ? createPortal(drawerNode, document.body) : drawerNode;
    }
    return <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">{content}</div>;
  };

  if (loading) {
    return renderContainer(
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando producción cultural...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return renderContainer(
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-sm space-y-3">
          <FiAlertCircle size={24} className="text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">Evento no encontrado</p>
          <p className="text-xs text-slate-500">No se pudo recuperar la información de la producción seleccionada.</p>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-amber-300 text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    );
  }

  const estado = event.estado || 'BORRADOR';
  const canEdit = ['BORRADOR', 'EN_CORRECCION'].includes(estado);
  const canSendReview = ['BORRADOR', 'EN_CORRECCION'].includes(estado);
  const canCancel = ['PUBLICADO', 'BORRADOR', 'PENDIENTE_REVISION'].includes(estado);
  const canReopen = ['CANCELADO', 'RECHAZADO'].includes(estado);
  const canWithdraw = estado === 'PENDIENTE_REVISION';

  const fotoUrl = event.foto || event.imagen || event.urlImagen || null;
  const categoriaNombre =
    typeof event.categoria === 'object'
      ? event.categoria?.nombre || 'General'
      : event.categoria || 'General';
  const organizacionNombre =
    typeof event.organizacion === 'object'
      ? event.organizacion?.razonSocial || event.organizacion?.nombre || 'Mi Organización'
      : event.organizacion || 'Mi Organización';

  return renderContainer(
    <div className="flex flex-col h-full bg-white text-slate-900">
      {/* 1. Header Visual con Portada a Todo Color Natural (220px) */}
      <div className="relative h-[220px] w-full bg-[#0F2342] shrink-0 overflow-hidden">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#0F2342] flex items-center justify-center text-slate-500 font-mono text-xs uppercase tracking-widest">
            <span>Sin imagen de cartelera</span>
          </div>
        )}
        {/* Degradado oscuro sutil en la base */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(15, 35, 66, 0.95) 0%, rgba(15, 35, 66, 0.4) 50%, transparent 100%)',
          }}
        />

        {/* Botón Cerrar (✕) Cuadrado Minimalista */}
        <button
          type="button"
          onClick={handleClose}
          disabled={Boolean(runningAction) || Boolean(actionLoading)}
          aria-label="Cerrar detalle"
          title="Cerrar"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-[2px] bg-[#0F2342]/85 hover:bg-[#0F2342] text-white flex items-center justify-center cursor-pointer transition-colors shadow-sm disabled:opacity-50"
        >
          <FiX size={16} />
        </button>

        {/* Línea tipográfica monoespaciada + Título + Organización */}
        <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1.5">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase text-[#F8FAFC]">
            <span>{categoriaNombre}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
            <span className="text-[#F5B800] font-bold">{labelMap[estado] || estado}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white uppercase tracking-tight line-clamp-2 leading-tight">
            {event.titulo}
          </h2>

          <p className="font-mono text-[10px] text-slate-300 truncate">
            ORGANIZADO POR {organizacionNombre.toUpperCase()} {event.lugar ? `• ${event.lugar.toUpperCase()}` : ''}
          </p>
        </div>
      </div>

      {/* 2. Cuerpo del Expediente Scrolleable */}
      <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
        {/* Advertencia si la organización no está aprobada */}
        {!canSendEvents && (
          <div className="p-3.5 rounded-[2px] bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-3">
            <FiAlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold uppercase tracking-wider font-mono text-[10px]">
                {orgSuspended ? 'Organización suspendida' : 'Documento de verificación pendiente'}
              </p>
              <p className="mt-0.5 text-amber-800">
                {orgSuspended
                  ? 'La organización está suspendida y no puede enviar eventos a revisión.'
                  : 'Carga el RUT de tu organización o espera su aprobación para enviar eventos a revisión.'}
              </p>
            </div>
          </div>
        )}

        {/* Fila Horizontal de Coordenadas Temporales con Filete Vertical */}
        <div className="border border-[#E2E8F0] rounded-[2px] bg-[#FAFAFA] p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">
          <div className="p-2 sm:px-4 font-mono text-xs">
            <span className="text-[10px] uppercase text-[#64748B] block mb-0.5 tracking-wider font-semibold">
              Fecha del Evento
            </span>
            <span className="text-[#0F2342] font-bold text-sm tracking-tight">
              {event.fecha ? formatFecha(event.fecha) : 'Sin fecha definida'}
            </span>
          </div>
          <div className="p-2 sm:px-4 font-mono text-xs">
            <span className="text-[10px] uppercase text-[#64748B] block mb-0.5 tracking-wider font-semibold">
              Hora de Inicio
            </span>
            <span className="text-[#0F2342] font-bold text-sm tracking-tight">
              {event.hora ? formatHora12(event.hora) : 'Sin hora definida'}
            </span>
          </div>
        </div>

        {/* Bloque Geográfico: UBICACIÓN Y PROYECCIÓN */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F2342] font-bold">
              Ubicación y Proyección
            </span>
            <span className="font-mono text-[10px] text-[#64748B] uppercase">
              {event.lugar || 'Cartagena'}
            </span>
          </div>

          {event.latitud !== undefined &&
          event.latitud !== null &&
          event.longitud !== undefined &&
          event.longitud !== null &&
          !isNaN(Number(event.latitud)) &&
          !isNaN(Number(event.longitud)) &&
          Number(event.latitud) !== 0 ? (
            <div className="rounded-[2px] border border-[#E2E8F0] h-48 w-full overflow-hidden relative z-0">
              <MapContainer
                center={[Number(event.latitud), Number(event.longitud)]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[Number(event.latitud), Number(event.longitud)]}
                  icon={customPinIcon()}
                />
              </MapContainer>
            </div>
          ) : (
            <div className="p-4 rounded-[2px] bg-[#FAFAFA] border border-[#E2E8F0] text-slate-400 text-xs font-mono text-center">
              Coordenadas cartográficas no disponibles para este evento.
            </div>
          )}
        </div>

        {/* Descripción Editorial */}
        <div className="space-y-2 border-t border-[#E2E8F0] pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B] font-bold block">
            Expediente & Sinopsis
          </span>
          <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-line font-normal">
            {event.descripcion || 'Sin descripción provista por el organizador.'}
          </p>
        </div>

        {/* Tabla Limpia de Localidades */}
        <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0F2342] font-bold">
              Localidades y Zonas ({event.localidades?.length || 0})
            </span>
          </div>

          {!event.localidades || event.localidades.length === 0 ? (
            <div className="p-4 rounded-[2px] bg-[#FAFAFA] border border-[#E2E8F0] text-slate-400 font-mono text-xs text-center">
              Este evento no tiene localidades configuradas registradas.
            </div>
          ) : (
            <div className="border border-[#E2E8F0] rounded-[2px] overflow-hidden">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#FAFAFA] border-b border-[#E2E8F0] text-[10px] uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th className="py-2.5 px-3">Localidad</th>
                    <th className="py-2.5 px-3">Precio</th>
                    <th className="py-2.5 px-3">Aforo</th>
                    <th className="py-2.5 px-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] bg-white">
                  {event.localidades.map((loc, idx) => {
                    const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
                    const pct = loc.capacidad > 0 ? Math.round((vendidas / loc.capacidad) * 100) : 0;
                    return (
                      <tr key={loc.id || idx} className="hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-3 font-semibold text-[#0F2342]">
                          {loc.nombre || `Zona ${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-3 text-[#0F2342] font-bold">
                          {formatPrice(loc.precio || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B]">
                          {loc.capacidad} cupos
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium">
                          {loc.disponibles !== undefined ? (
                            <span className={loc.disponibles > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                              {loc.disponibles > 0 ? `${loc.disponibles} disp.` : 'Agotada'}
                            </span>
                          ) : (
                            <span className="text-[#64748B]">{pct}% vend.</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historial de Moderación */}
        {historial.length > 0 && (
          <div className="space-y-3 border-t border-[#E2E8F0] pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B] font-bold block">
              Bitácora de Moderación
            </span>

            <div className="space-y-2">
              {historial.map((item, idx) => {
                const isRechazo = item.accion === 'RECHAZADO' || item.estadoResultante === 'RECHAZADO';
                const isCorreccion =
                  item.accion === 'CORRECCION_SOLICITADA' || item.estadoResultante === 'EN_CORRECCION';

                return (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-[2px] border border-[#E2E8F0] bg-[#FAFAFA] text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-bold uppercase text-[10px] text-[#0F2342]">
                        {item.accion || item.estadoResultante || 'REVISIÓN'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {item.fecha ? formatFechaHora12(item.fecha) : 'Reciente'}
                      </span>
                    </div>

                    {item.motivo && (
                      <p className="text-[11px] text-slate-800">
                        Motivo: <span className="font-semibold">{item.motivo.replace(/_/g, ' ')}</span>
                      </p>
                    )}

                    {item.observacion && (
                      <p className="bg-white p-2 rounded-[2px] border border-[#E2E8F0] text-slate-700 italic">
                        "{item.observacion}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Fijo de Acciones Editorial */}
      {Boolean(onAprobar || onSolicitarCorreccion || onRechazar) ? (
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4">
            {onRechazar && (
              <button
                type="button"
                onClick={() => onRechazar(event)}
                disabled={actionLoading}
                className="font-mono text-xs text-[#DC2626] hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
              >
                Rechazar evento
              </button>
            )}

            {onSolicitarCorreccion && (
              <button
                type="button"
                onClick={() => onSolicitarCorreccion(event)}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-[2px] border border-[#F5B800] bg-amber-50 hover:bg-amber-100 text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Solicitar Corrección
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onAprobar && (
              <button
                type="button"
                onClick={() => onAprobar(event)}
                disabled={actionLoading}
                className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-[#FFFFFF] hover:text-[#F5B800] font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>PROCESANDO...</span>
                  </>
                ) : (
                  <span>APROBAR Y PUBLICAR</span>
                )}
              </button>
            )}
          </div>
        </div>
      ) : readOnly ? (
        onEditBanner ? (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E2E8F0] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onEditBanner(event)}
              className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-[#FFFFFF] hover:text-[#F5B800] font-mono text-xs uppercase tracking-wider font-bold transition-all cursor-pointer shadow-xs"
            >
              EDITAR BANNER
            </button>
          </div>
        ) : null
      ) : estado !== 'FINALIZADO' ? (
        <div className="p-4 sm:p-5 bg-white border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0">
          <div>
            {/* Enlace Destructivo o de Pausa */}
            {canCancel && allowSuspend && (
              <button
                type="button"
                onClick={async () => {
                  const confirmed = await showConfirmAlert({
                    title: 'Suspender evento',
                    text: '¿Estás seguro de que deseas suspender o cancelar esta producción cultural?',
                    confirmButtonText: 'Sí, suspender',
                    isDanger: true,
                  });
                  if (confirmed) {
                    await handleAction('cancel', () => organizerService.cancelarEvento(event.id), 'Evento suspendido');
                  }
                }}
                disabled={Boolean(runningAction)}
                className="font-mono text-xs text-[#DC2626] hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
              >
                Suspender evento
              </button>
            )}

            {canWithdraw && (
              <button
                type="button"
                onClick={() => handleAction('withdraw', () => organizerService.retirarEvento(event.id), 'Evento retirado a borrador')}
                disabled={Boolean(runningAction)}
                className="font-mono text-xs text-amber-700 hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
              >
                Retirar a borrador
              </button>
            )}

            {canReopen && (
              <button
                type="button"
                onClick={() => handleAction('reopen', () => organizerService.reabrirEvento(event.id), 'Evento reabierto')}
                disabled={Boolean(runningAction)}
                className="font-mono text-xs text-emerald-700 hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
              >
                Reabrir evento
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit && onEdit(event)}
                disabled={Boolean(runningAction)}
                className="px-5 py-2.5 rounded-[2px] border border-[#0F2342] bg-white hover:bg-[#F8FAFC] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                EDITAR PRODUCCIÓN
              </button>
            )}

            {canSendReview && (
              <button
                type="button"
                onClick={() => {
                  if (!canSendEvents) {
                    Swal.fire({
                      icon: 'warning',
                      title: orgSuspended ? 'Organización suspendida' : 'Verificación pendiente',
                      text: orgSuspended
                        ? 'Tu organización está suspendida y no puede enviar eventos a revisión.'
                        : 'Carga el RUT de tu organización o espera su aprobación para enviar eventos a revisión.',
                    });
                    return;
                  }
                  handleAction('review', () => organizerService.enviarRevision(event.id), 'Evento enviado a revisión');
                }}
                disabled={Boolean(runningAction) || !canSendEvents}
                className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#1B365D] text-[#FFFFFF] hover:text-[#F5B800] font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-2"
              >
                {runningAction === 'review' ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ENVIANDO...</span>
                  </>
                ) : (
                  <span>ENVIAR A REVISIÓN</span>
                )}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
