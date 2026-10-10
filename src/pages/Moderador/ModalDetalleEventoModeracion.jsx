import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiCheck,
  FiEdit3,
  FiCalendar,
  FiMapPin,
  FiClock,
  FiUsers,
  FiLayers,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiTag,
  FiInfo,
} from 'react-icons/fi';
import Badge from '../../components/Shared/Badge.jsx';
import moderationService from '../../services/moderationService.js';

export default function ModalDetalleEventoModeracion({
  evento,
  motivos = [],
  isOpen,
  onClose,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
  actionLoading = false,
}) {
  const [localidades, setLocalidades] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Formulario rápido inline de corrección / rechazo
  const [actionType, setActionType] = useState(null); // 'CORRECCION' | 'RECHAZO' | null
  const [motivoSelected, setMotivoSelected] = useState('');
  const [observacion, setObservacion] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isOpen || !evento?.id) return;

    // Resetear formulario
    setActionType(null);
    setObservacion('');
    setFormError('');
    if (motivos.length > 0) setMotivoSelected(motivos[0]);

    // 1. Cargar localidades reales del evento
    let isMounted = true;
    async function loadEventData() {
      try {
        setLoadingLocalidades(true);
        const locs = await moderationService.getLocalidades(evento.id);
        if (isMounted) {
          setLocalidades(Array.isArray(locs) ? locs : locs?.content || []);
        }
      } catch {
        if (isMounted) setLocalidades([]);
      } finally {
        if (isMounted) setLoadingLocalidades(false);
      }

      // 2. Cargar historial de moderaciones del evento
      try {
        setLoadingHistorial(true);
        const histData = await moderationService.getHistorialModeracion(evento.id, {
          page: 0,
          size: 10,
        });
        if (isMounted) {
          const items = Array.isArray(histData) ? histData : histData?.content || [];
          setHistorial(items);
        }
      } catch {
        if (isMounted) setHistorial([]);
      } finally {
        if (isMounted) setLoadingHistorial(false);
      }
    }

    loadEventData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, evento?.id, motivos]);

  if (!isOpen || !evento) return null;

  // Cálculo del aforo total derivado de las localidades reales
  const totalAforo = localidades.reduce(
    (sum, loc) => sum + (Number(loc.capacidad) || 0),
    0
  );

  const categoriaNombre =
    typeof evento.categoria === 'object'
      ? evento.categoria?.nombre
      : evento.categoria || 'Evento';

  const organizacionNombre =
    typeof evento.organizacion === 'object'
      ? evento.organizacion?.nombre
      : evento.organizacion || 'Organización';

  const handleActionSubmit = (e) => {
    e.preventDefault();
    if (!motivoSelected) {
      setFormError('Por favor selecciona un motivo.');
      return;
    }
    if (!observacion.trim()) {
      setFormError('La observación es obligatoria para explicar la decisión a la organización.');
      return;
    }

    setFormError('');
    if (actionType === 'CORRECCION') {
      onSolicitarCorreccion(evento.id, {
        motivo: motivoSelected,
        observacion: observacion.trim(),
      });
    } else if (actionType === 'RECHAZO') {
      onRechazar(evento.id, {
        motivo: motivoSelected,
        observacion: observacion.trim(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer lateral derecho */}
      <div
        className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner de Imagen y Encabezado */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900 shrink-0">
          {evento.foto ? (
            <img
              src={evento.foto}
              alt={evento.titulo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
              <span className="text-white/20 text-5xl font-display font-black">
                EventHive
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

          {/* Botón de cierre */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm shadow-md"
            aria-label="Cerrar modal"
          >
            <FiX size={18} />
          </button>

          {/* Datos sobre la imagen */}
          <div className="absolute bottom-4 left-5 right-5 sm:left-7 sm:right-7">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-brand text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                {categoriaNombre}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                ID #{evento.id}
              </span>
              <span className="bg-amber-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                {evento.estado || 'PENDIENTE_REVISION'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-white leading-snug line-clamp-2">
              {evento.titulo}
            </h2>

            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <strong className="text-white font-semibold">{organizacionNombre}</strong>
              {evento.lugar && (
                <>
                  <span>•</span>
                  <span className="truncate">{evento.lugar}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Contenido scrolleable con pestañas / secciones */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <FiCalendar size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Fecha</p>
                <p className="font-semibold text-slate-800">{evento.fecha || 'Sin fecha'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <FiClock size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Hora</p>
                <p className="font-semibold text-slate-800">{evento.hora || 'Sin hora'}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                <FiUsers size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Aforo Calculado</p>
                <p className="font-semibold text-slate-800">
                  {loadingLocalidades
                    ? 'Calculando...'
                    : totalAforo > 0
                    ? `${totalAforo.toLocaleString()} personas`
                    : 'Sin localidades'}
                </p>
              </div>
            </div>
          </div>

          {/* Ubicación y Coordenadas */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <FiMapPin className="text-brand" size={16} />
              <span>Lugar y Ubicación</span>
            </div>
            <p className="text-slate-600 pl-6">{evento.lugar || 'Ubicación no especificada'}</p>
            {(evento.latitud !== undefined && evento.latitud !== null && evento.longitud !== undefined && evento.longitud !== null) && (
              <div className="pl-6 pt-1 text-[11px] text-slate-500 flex items-center gap-2">
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  Lat: {evento.latitud}
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  Lng: {evento.longitud}
                </span>
              </div>
            )}
          </div>

          {/* Descripción del Evento */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Descripción del Evento
            </h4>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-slate-700 leading-relaxed text-xs">
              {evento.descripcion || 'Sin descripción provista por el organizador.'}
            </div>
          </div>

          {/* Localidades reales cargadas del endpoint */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiLayers className="text-brand" size={14} />
                <span>Localidades y Precios ({localidades.length})</span>
              </h4>
              {totalAforo > 0 && (
                <span className="text-[11px] text-slate-500">
                  Aforo total: <strong className="text-slate-800">{totalAforo.toLocaleString()}</strong>
                </span>
              )}
            </div>

            {loadingLocalidades ? (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-slate-400 animate-pulse">
                Consultando localidades en el servidor...
              </div>
            ) : localidades.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-center">
                Este evento no tiene localidades configuradas registradas.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {localidades.map((loc, idx) => (
                  <div
                    key={loc.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">
                        {loc.nombre || `Localidad #${idx + 1}`}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Capacidad: {loc.capacidad ? `${loc.capacidad} cupos` : 'N/D'}
                        {loc.cantidadDisponible !== undefined &&
                          loc.cantidadDisponible !== null && (
                            <span> · Disp: {loc.cantidadDisponible}</span>
                          )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-extrabold text-sm text-brand">
                        {loc.precio === 0 || !loc.precio
                          ? 'Gratis'
                          : new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              maximumFractionDigits: 0,
                            }).format(loc.precio)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historial de moderaciones reales del evento */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <FiFileText className="text-brand" size={14} />
              <span>Historial de Moderación del Evento</span>
            </h4>

            {loadingHistorial ? (
              <div className="p-4 rounded-2xl bg-slate-50 text-center text-slate-400 animate-pulse">
                Cargando historial de revisiones...
              </div>
            ) : historial.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-center">
                Aún no registra intervenciones de moderación previas.
              </div>
            ) : (
              <div className="space-y-2">
                {historial.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase shrink-0 mt-0.5 ${
                        item.accion === 'APROBADO' || item.accion === 'APROBAR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.accion === 'RECHAZADO' || item.accion === 'RECHAZAR'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.accion}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800">
                        {item.observacion || 'Sin observación registrada.'}
                      </p>
                      {item.id && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Registro #{item.id}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario Inline de Corrección / Rechazo si se activó */}
          {actionType && (
            <div
              className={`p-5 rounded-3xl border animate-in fade-in duration-200 ${
                actionType === 'RECHAZO'
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-amber-50/70 border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4
                  className={`font-bold text-xs uppercase tracking-wider ${
                    actionType === 'RECHAZO' ? 'text-rose-900' : 'text-amber-900'
                  }`}
                >
                  {actionType === 'RECHAZO'
                    ? 'Confirmar Rechazo del Evento'
                    : 'Solicitar Correcciones a la Organización'}
                </h4>
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <FiX size={15} />
                </button>
              </div>

              <form onSubmit={handleActionSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Motivo oficial <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={motivoSelected}
                    onChange={(e) => setMotivoSelected(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-brand"
                  >
                    {motivos.map((m) => (
                      <option key={m} value={m}>
                        {m.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Observación / Justificación obligatoria <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    placeholder="Describe exactamente qué debe corregirse o el fundamento del rechazo..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-brand resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-semibold text-rose-600 bg-rose-100/70 p-2 rounded-lg">
                    {formError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActionType(null)}
                    disabled={actionLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
                      actionType === 'RECHAZO'
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {actionLoading ? 'Procesando...' : 'Confirmar Envío'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer de Acciones del Moderador */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500">
            Revisión técnica de Evento #{evento.id}
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {!actionType && (
              <>
                <button
                  type="button"
                  onClick={() => setActionType('CORRECCION')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FiEdit3 size={14} /> Solicitar Corrección
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('RECHAZO')}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FiX size={14} /> Rechazar
                </button>

                <button
                  type="button"
                  onClick={() => onAprobar(evento.id)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-md shadow-brand/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <FiCheck size={14} /> Aprobar y Publicar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
