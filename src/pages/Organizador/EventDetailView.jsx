import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import { organizerService } from '../../services/organizerService.js';
import moderationService from '../../services/moderationService.js';
import Swal from 'sweetalert2';
import { showConfirmAlert } from '../../utils/alertUtils.js';
import { formatFecha, formatHora24, formatFechaHora } from '../../utils/formatters.js';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

const customPinIcon = () =>
  L.divIcon({
    className: 'custom-moderacion-pin',
    html: `
      <div style="position: relative; width: 30px; height: 38px; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
        <svg viewBox="0 0 34 42" width="30" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 27.5 14.5 40.5 16.1 41.9C16.6 42.3 17.4 42.3 17.9 41.9C19.5 40.5 34 27.5 34 17C34 7.61 26.39 0 17 0Z" fill="#f59e0b" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="17" cy="17" r="5" fill="#FFFFFF"/>
        </svg>
      </div>
    `,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38],
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
  onBack,
  onEdit,
  isDrawer = true,
  canSendEvents = true,
  orgSuspended = false,
}) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const p1 = organizerService
      .getEventoDetalle(eventId)
      .then((data) => {
        if (isMounted && data) setEvent(data);
      })
      .catch((err) => console.error('Error cargando detalle:', err));

    const p2 = moderationService
      .getHistorialModeracion(eventId, { page: 0, size: 20 })
      .then((res) => {
        if (isMounted) {
          const items = Array.isArray(res) ? res : res?.content || [];
          setHistorial(items);
        }
      })
      .catch(() => {});

    Promise.allSettled([p1, p2]).finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [eventId]);

  const handleAction = async (actionFn, successMsg) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await actionFn();
      const updated = await organizerService.getEventoDetalle(eventId);
      if (updated) setEvent(updated);
      if (successMsg) {
        Swal.fire({
          icon: 'success',
          title: 'Acción realizada',
          text: successMsg,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Error al realizar la acción.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderContainer = (content) => {
    if (isDrawer) {
      const drawerNode = (
        <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-pointer"
            onClick={onBack}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
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
          <div className="w-9 h-9 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Cargando detalle del evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return renderContainer(
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-sm">
          <p className="text-sm font-bold text-slate-800">Evento no encontrado</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">No se pudo recuperar la información del evento solicitado.</p>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
          >
            Cerrar
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

  const formatCurrency = (val) => {
    if (val == null || val === undefined || isNaN(val)) return '$0';
    return `$${Number(val).toLocaleString('es-CO')}`;
  };

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
      {/* 1. Header estilo Moderador: Banner superior con gradiente oscuro, título y badges */}
      <div className="relative h-60 sm:h-72 w-full bg-slate-900 shrink-0 overflow-hidden">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={event.titulo}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Botón flotante para cerrar tipo círculo */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Cerrar detalle"
          title="Cerrar"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-md cursor-pointer transition-transform hover:scale-105 shadow-md"
        >
          <FiX size={18} />
        </button>

        {/* Badges de categoría / estado y Título del evento sobre el gradiente */}
        <div className="absolute bottom-5 left-6 right-6 z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-xs">
              {categoriaNombre}
            </span>
            <Badge tone={toneMap[estado] || 'neutral'} size="sm">
              {labelMap[estado] || estado}
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug line-clamp-2">
            {event.titulo}
          </h2>

          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
            <strong className="text-white font-semibold">{organizacionNombre}</strong>
            {event.lugar && (
              <>
                <span>•</span>
                <span className="truncate">{event.lugar}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* 2. Contenido Scrolleable */}
      <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
        {/* Advertencia si la organización no está aprobada */}
        {!canSendEvents && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
            <FiAlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">
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

        {/* Metadata Grid (Fecha y Hora sin recuadro de aforo) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <FiCalendar size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Fecha</p>
              <p className="font-semibold text-slate-800">{event.fecha ? formatFecha(event.fecha) : 'Sin fecha'}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <FiClock size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Hora</p>
              <p className="font-semibold text-slate-800">{event.hora ? formatHora24(event.hora) : 'Sin hora'}</p>
            </div>
          </div>
        </div>

        {/* Ubicación y Mapa Geográfico sin coordenadas numéricas visibles */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <FiMapPin className="text-amber-500" size={16} />
            <span>Ubicación del Evento</span>
          </div>
          <p className="text-slate-600 pl-6 text-xs">{event.lugar || 'Ubicación no especificada'}</p>

          {event.latitud !== undefined &&
          event.latitud !== null &&
          event.longitud !== undefined &&
          event.longitud !== null &&
          !isNaN(Number(event.latitud)) &&
          !isNaN(Number(event.longitud)) ? (
            <div className="overflow-hidden rounded-xl border border-slate-200 h-48 w-full relative z-0">
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
            <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-slate-500 text-[11px] text-center italic">
              Ubicación en mapa no disponible para este evento.
            </div>
          )}
        </div>

        {/* Descripción del Evento */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Descripción del Evento
          </h4>
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
            {event.descripcion || 'Sin descripción provista por el organizador.'}
          </div>
        </div>

        {/* Localidades y Entradas */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FiLayers className="text-amber-500" size={14} />
              <span>Localidades y Entradas ({event.localidades?.length || 0})</span>
            </h4>
          </div>

          {!event.localidades || event.localidades.length === 0 ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
              Este evento no tiene localidades configuradas registradas.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {event.localidades.map((loc, idx) => {
                const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
                const pct = loc.capacidad > 0 ? Math.round((vendidas / loc.capacidad) * 100) : 0;
                return (
                  <div
                    key={loc.id || idx}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {loc.nombre || `Localidad #${idx + 1}`}
                      </span>
                      <span className="font-display font-black text-xs text-amber-600">
                        {formatCurrency(loc.precio)}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Capacidad: <strong className="text-slate-700">{loc.capacidad} cupos</strong></span>
                      {loc.disponibles !== undefined && (
                        <span>Disp: <strong className="text-emerald-600">{loc.disponibles}</strong></span>
                      )}
                    </div>

                    {loc.capacidad > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Vendidas: {Math.max(0, vendidas)}</span>
                          <span className="font-bold text-amber-600">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Historial de Moderación del Evento */}
        {historial.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <FiLayers className="text-amber-500" size={14} />
              <span>Historial de Moderación</span>
            </h4>

            <div className="space-y-2">
              {historial.map((item, idx) => {
                const isRechazo = item.accion === 'RECHAZADO' || item.estadoResultante === 'RECHAZADO';
                const isCorreccion =
                  item.accion === 'CORRECCION_SOLICITADA' || item.estadoResultante === 'EN_CORRECCION';

                return (
                  <div
                    key={item.id || idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      isCorreccion
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : isRechazo
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                        {item.accion || item.estadoResultante || 'REVISIÓN'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {item.fecha ? formatFechaHora(item.fecha) : 'Reciente'}
                      </span>
                    </div>

                    {item.motivo && (
                      <p className="font-bold text-[11px]">
                        Motivo: <span className="font-semibold text-slate-700">{item.motivo.replace(/_/g, ' ')}</span>
                      </p>
                    )}

                    {item.observacion && (
                      <p className="bg-white/90 p-2.5 rounded-lg border border-slate-200/60 text-slate-800 font-medium italic">
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

      {/* 3. Footer con Acciones de Gestión del Organizador (Ocultas si el evento está FINALIZADO) */}
      {estado !== 'FINALIZADO' && (
        <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex flex-wrap items-center justify-end gap-2 shrink-0">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit && onEdit(event)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:border-amber-500 hover:text-amber-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <FiEdit3 size={14} /> Editar evento
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
                handleAction(() => organizerService.enviarRevision(event.id), 'Evento enviado a revisión');
              }}
              disabled={actionLoading || !canSendEvents}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1.5"
              title={
                orgSuspended
                  ? 'La organización está suspendida'
                  : !canSendEvents
                    ? 'Carga el RUT o espera la aprobación de la organización'
                    : 'Enviar a moderación'
              }
            >
              {actionLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FiSend size={14} /> Enviar a revisión
                </>
              )}
            </button>
          )}

          {canWithdraw && (
            <button
              type="button"
              onClick={() => handleAction(() => organizerService.retirarEvento(event.id))}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <FiRotateCcw size={14} /> Retirar a borrador
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={async () => {
                const confirmed = await showConfirmAlert({
                  title: 'Suspender evento',
                  text: '¿Estás seguro de que deseas suspender/cancelar este evento?',
                  confirmButtonText: 'Suspender',
                  isDanger: true,
                });
                if (confirmed) {
                  await handleAction(() => organizerService.cancelarEvento(event.id));
                }
              }}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <FiPauseCircle size={14} /> Suspender evento
            </button>
          )}

          {canReopen && (
            <button
              type="button"
              onClick={() => handleAction(() => organizerService.reabrirEvento(event.id))}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <FiRotateCcw size={14} /> Reabrir evento
            </button>
          )}
        </div>
      )}
    </div>
  );
}
