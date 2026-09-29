import React, { useState } from 'react';
import { FiAlertTriangle, FiX, FiCheck, FiInfo } from 'react-icons/fi';

export default function ModalAccionModeracion({
  evento,
  tipo = 'correccion', // 'correccion' | 'rechazo'
  motivos = [],
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(motivos[0] || '');
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !evento) return null;

  const isRechazo = tipo === 'rechazo';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivoSeleccionado) {
      setError('Debes seleccionar un motivo.');
      return;
    }
    if (!observacion.trim()) {
      setError('La observación es obligatoria para explicar la decisión a la organización.');
      return;
    }
    setError('');
    onSubmit({
      motivo: motivoSeleccionado,
      observacion: observacion.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          className={`p-6 border-b ${
            isRechazo
              ? 'bg-rose-50/70 border-rose-100'
              : 'bg-amber-50/70 border-amber-100'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isRechazo
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3
                  className={`font-display text-base font-bold ${
                    isRechazo ? 'text-rose-950' : 'text-amber-950'
                  }`}
                >
                  {isRechazo ? 'Rechazar Evento' : 'Solicitar Corrección de Evento'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {evento.titulo}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200/60 transition-colors"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
            <FiInfo size={16} className="text-brand shrink-0 mt-0.5" />
            <p>
              {isRechazo
                ? 'El evento pasará al estado RECHAZADO. La organización recibirá la justificación técnica y normativa.'
                : 'El evento pasará al estado EN_CORRECCION. La organización podrá subsanar las observaciones y reenviar su solicitud.'}
            </p>
          </div>

          {/* Selector de Motivo obtenido del endpoint /api/enums/motivos-rechazos */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Motivo oficial del sistema <span className="text-rose-500">*</span>
            </label>
            <select
              value={motivoSeleccionado}
              onChange={(e) => setMotivoSeleccionado(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer"
            >
              {motivos.length === 0 ? (
                <option value="">Cargando motivos...</option>
              ) : (
                motivos.map((m) => (
                  <option key={m} value={m}>
                    {m.replace(/_/g, ' ')}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Observación / Justificación */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Observación detallada para la organización <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Explica detalladamente qué puntos deben corregirse o las razones del rechazo (fechas, aforos, permisos, ubicación, políticas)..."
              className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 ${
                isRechazo
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
              }`}
            >
              {loading ? (
                <span>Procesando...</span>
              ) : isRechazo ? (
                <>
                  <FiX size={15} /> Confirmar Rechazo
                </>
              ) : (
                <>
                  <FiCheck size={15} /> Enviar Corrección
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
