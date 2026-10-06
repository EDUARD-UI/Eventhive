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

export default function EventDetailView({ eventId, onBack, onEdit }) {
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
      // Reload event detail
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

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Cargando detalle del evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-700">Evento no encontrado</p>
        <button type="button" onClick={onBack} className="mt-4 text-xs font-bold text-brand hover:underline">
          ← Volver a la cartelera
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

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand transition-colors shrink-0"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {event.titulo}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Detalle de la publicación cultural
            </p>
          </div>
        </div>

        <Badge tone={toneMap[estado] || 'neutral'} className="self-start sm:self-auto">
          {labelMap[estado] || estado}
        </Badge>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Event info */}
        <div className="space-y-5">
          {/* Photo + basic info */}
          {event.foto && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              <img
                src={event.foto}
                alt={event.titulo}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Información del Evento
            </h3>

            {event.descripcion && (
              <p className="text-xs text-slate-600 leading-relaxed">
                {event.descripcion}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <FiCalendar size={14} className="text-brand shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fecha</span>
                  <span className="font-bold text-slate-800">{event.fecha || 'No definida'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <FiClock size={14} className="text-amber-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Hora</span>
                  <span className="font-bold text-slate-800">{event.hora || 'No definida'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <FiMapPin size={14} className="text-rose-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Lugar</span>
                  <span className="font-bold text-slate-800">{event.lugar || 'No definido'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <FiTag size={14} className="text-purple-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Categoría</span>
                  <span className="font-bold text-slate-800">{event.categoria?.nombre || 'Sin categoría'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Localidades */}
          {event.localidades && event.localidades.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h3 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Localidades y Entradas
              </h3>
              <div className="space-y-3">
                {event.localidades.map((loc) => {
                  const vendidas = (loc.capacidad || 0) - (loc.disponibles || 0);
                  const pct = loc.capacidad > 0 ? Math.round((vendidas / loc.capacidad) * 100) : 0;
                  return (
                    <div key={loc.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-slate-900">{loc.nombre}</span>
                        <span className="font-bold text-xs text-brand">{formatCurrency(loc.precio)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600">
                          Vendidas: <strong>{vendidas}</strong> / {loc.capacidad}
                        </span>
                        <span className="font-bold text-brand">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : 'bg-brand'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Acciones Disponibles
            </h4>

            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit && onEdit(event)}
                disabled={actionLoading}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
              >
                <FiEdit3 size={14} /> Editar evento
              </button>
            )}

            {canSendReview && (
              <button
                type="button"
                onClick={() => handleAction(() => organizerService.enviarRevision(event.id))}
                disabled={actionLoading}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
              >
                <FiSend size={14} /> Enviar a revisión
              </button>
            )}

            {canWithdraw && (
              <button
                type="button"
                onClick={() => handleAction(() => organizerService.retirarEvento(event.id))}
                disabled={actionLoading}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
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
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                <FiPauseCircle size={14} /> Suspender evento
              </button>
            )}

            {canReopen && (
              <button
                type="button"
                onClick={() => handleAction(() => organizerService.reabrirEvento(event.id))}
                disabled={actionLoading}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <FiRotateCcw size={14} /> Reabrir evento
              </button>
            )}

            <button
              type="button"
              onClick={onBack}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <FiArrowLeft size={14} /> Volver a la cartelera
            </button>
          </div>

          {/* Organization info */}
          {event.organizacion && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <h4 className="font-display text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-3">
                Organización
              </h4>
              <p className="text-xs font-bold text-slate-800">{event.organizacion.nombre}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Organizador Oficial</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
