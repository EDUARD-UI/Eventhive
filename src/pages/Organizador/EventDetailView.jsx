import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiMapPin,
  FiPauseCircle,
  FiSend,
  FiTag,
  FiUsers,
  FiRotateCcw,
  FiX,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import { organizerService } from '../../services/organizerService.js';
import Swal from 'sweetalert2';

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

export default function EventDetailView({ eventId, onBack, onEdit, isDrawer = true }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    organizerService.getEventoDetalle(eventId)
      .then((data) => {
        if (isMounted && data) setEvent(data);
      })
      .catch((err) => console.error('Error cargando detalle:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [eventId]);

  const handleAction = async (actionFn, successMsg) => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      await actionFn();
      // Recargar detalle del evento
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

  const renderLoadingOrError = (content) => {
    if (isDrawer) {
      return (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity cursor-pointer"
            onClick={onBack}
            aria-hidden="true"
          />
          <div className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[680px] xl:w-[740px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 p-6 flex flex-col justify-center">
            {content}
          </div>
        </div>
      );
    }
    return content;
  };

  if (loading) {
    return renderLoadingOrError(
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-md mx-auto">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Cargando detalle del evento...</p>
      </div>
    );
  }

  if (!event) {
    return renderLoadingOrError(
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm max-w-md mx-auto">
        <p className="text-sm font-bold text-slate-700">Evento no encontrado</p>
        <button
          type="button"
          onClick={onBack}
          aria-label="Cerrar"
          className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-black transition-colors"
        >
          Cerrar
        </button>
      </div>
    );
  }

  const estado = event.estado || 'BORRADOR';
  const canEdit = ['BORRADOR', 'EN_CORRECCION'].includes(estado);
  const canSendReview = estado === 'BORRADOR';
  const canCancel = ['PUBLICADO', 'BORRADOR', 'PENDIENTE_REVISION'].includes(estado);
  const canReopen = ['CANCELADO', 'RECHAZADO'].includes(estado);
  const canWithdraw = estado === 'PENDIENTE_REVISION';

  const formatCurrency = (val) => {
    if (val === 0) return 'Gratis';
    return `$${Number(val).toLocaleString('es-CO')}`;
  };

  const detailContent = (
    <div className="space-y-6">
      {/* Header con botón de cerrar que es ÚNICAMENTE el ícono X sin texto */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge tone={toneMap[estado] || 'neutral'}>
              {labelMap[estado] || estado}
            </Badge>
            {event.categoria?.nombre && (
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                {event.categoria.nombre}
              </span>
            )}
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words leading-snug">
            {event.titulo}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detalle de la publicación cultural
          </p>
        </div>

        {/* Ícono de X para cerrar SOLO, sin texto */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Cerrar detalle"
          title="Cerrar"
          className="w-10 h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors shadow-2xs shrink-0 cursor-pointer"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Rejilla de contenido principal */}
      <div className="grid grid-cols-1 gap-6">
        {/* Información del Evento */}
        <div className="space-y-5">
          {/* Foto + datos básicos */}
          {event.foto && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-72">
              <img
                src={event.foto}
                alt={event.titulo}
                className="w-full h-56 sm:h-64 object-cover"
              />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Información del Evento
            </h3>

            {event.descripcion && (
              <p className="text-xs text-slate-600 leading-relaxed break-words">
                {event.descripcion}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0">
                <FiCalendar size={15} className="text-amber-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha</span>
                  <span className="font-bold text-slate-800 truncate block">{event.fecha || 'No definida'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0">
                <FiClock size={15} className="text-amber-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hora</span>
                  <span className="font-bold text-slate-800 truncate block">{event.hora || 'No definida'}</span>
                </div>
              </div>

              {/* Lugar con soporte para textos largos sin sobresalir en teléfonos */}
              <div className="flex items-start sm:items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0 sm:col-span-2">
                <FiMapPin size={15} className="text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lugar</span>
                  <span className="font-bold text-slate-800 break-words block leading-snug">{event.lugar || 'No definido'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0 sm:col-span-2">
                <FiTag size={15} className="text-purple-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Categoría</span>
                  <span className="font-bold text-slate-800 truncate block">{event.categoria?.nombre || 'Sin categoría'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Localidades */}
          {event.localidades && event.localidades.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 mb-3">
                Localidades y Entradas
              </h3>
              <div className="space-y-2.5">
                {event.localidades.map((loc) => {
                  const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
                  const pct = loc.capacidad > 0 ? Math.round((vendidas / loc.capacidad) * 100) : 0;
                  return (
                    <div key={loc.id} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900">{loc.nombre}</span>
                        <span className="font-black text-xs text-slate-900">{formatCurrency(loc.precio)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600">
                          Vendidas: <strong>{vendidas}</strong> / {loc.capacidad}
                        </span>
                        <span className="font-bold text-amber-600">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Barra de Acciones Disponibles */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
              Acciones de Gestión
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(event)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-amber-500 hover:text-amber-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiEdit3 size={14} /> Editar evento
                </button>
              )}

              {canSendReview && (
                <button
                  type="button"
                  onClick={() => handleAction(() => organizerService.enviarRevision(event.id))}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <FiSend size={14} /> Enviar a revisión
                </button>
              )}

              {canWithdraw && (
                <button
                  type="button"
                  onClick={() => handleAction(() => organizerService.retirarEvento(event.id))}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiRotateCcw size={14} /> Retirar a borrador
                </button>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas suspender/cancelar este evento?')) {
                      handleAction(() => organizerService.cancelarEvento(event.id));
                    }
                  }}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiPauseCircle size={14} /> Suspender evento
                </button>
              )}

              {canReopen && (
                <button
                  type="button"
                  onClick={() => handleAction(() => organizerService.reabrirEvento(event.id))}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <FiRotateCcw size={14} /> Reabrir evento
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
        {/* Backdrop oscurecido al hacer clic afuera */}
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs transition-opacity cursor-pointer"
          onClick={onBack}
          aria-hidden="true"
        />

        {/* Panel lateral que se despliega desde la derecha */}
        <div className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[680px] xl:w-[740px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 p-6 sm:p-7">
          {detailContent}
        </div>
      </div>
    );
  }

  return detailContent;
}
