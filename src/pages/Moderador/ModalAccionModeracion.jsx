import React, { useState } from 'react';
import { FiAlertTriangle, FiX, FiCheck, FiInfo } from 'react-icons/fi';

const MOTIVOS_OFICIALES = [
  { value: 'INFORMACION_INCOMPLETA', label: 'Información Incompleta o Insuficiente' },
  { value: 'IMAGEN_NO_PERMITIDA', label: 'Imagen No Permitida o Ausente' },
  { value: 'FALTA_PERMISO_LEGAL', label: 'Falta Permiso Legal o Autorización' },
  { value: 'CATEGORIA_INCORRECTA', label: 'Categoría Incorrecta' },
  { value: 'INCUMPLE_POLITICAS', label: 'Incumple Políticas de la Plataforma' },
  { value: 'FECHA_INVALIDA', label: 'Fecha u Horario Inválido' },
  { value: 'LOCALIDADES_INVALIDAS', label: 'Localidades o Precios Inválidos' },
  { value: 'OTRO', label: 'Otro Motivo (Observación requerida)' },
];

export default function ModalAccionModeracion({
  evento,
  tipo = 'correccion', // 'correccion' | 'rechazo'
  motivos = [],
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) {
  const [motivoSeleccionado, setMotivoSeleccionado] = useState(
    motivos[0] || MOTIVOS_OFICIALES[0].value
  );
  const [observacion, setObservacion] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !evento) return null;

  const isRechazo = tipo === 'rechazo';

  // Combinar motivos del backend si existen con el mapa oficial
  const opcionesMotivos =
    motivos.length > 0
      ? motivos.map((m) => {
          const match = MOTIVOS_OFICIALES.find((mo) => mo.value === m);
          return match || { value: m, label: m.replace(/_/g, ' ') };
        })
      : MOTIVOS_OFICIALES;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivoSeleccionado) {
      setError('Debes seleccionar un motivo.');
      return;
    }
    if (motivoSeleccionado === 'OTRO' && !observacion.trim()) {
      setError('La observación es obligatoria cuando seleccionas "Otro Motivo".');
      return;
    }
    if (!observacion.trim()) {
      setError('Por favor detalla la observación para que la organización comprenda la resolución.');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div
          className={`p-6 border-b ${
            isRechazo
              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50'
              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isRechazo
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                }`}
              >
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <h3
                  className={`font-extrabold text-base ${
                    isRechazo
                      ? 'text-rose-950 dark:text-rose-100'
                      : 'text-amber-950 dark:text-amber-100'
                  }`}
                >
                  {isRechazo ? 'Rechazar Evento' : 'Solicitar Corrección de Evento'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {evento.titulo}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/80 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200/60 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <FiInfo size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              {isRechazo
                ? 'El evento pasará al estado RECHAZADO. La organización recibirá la justificación técnica y normativa.'
                : 'El evento pasará al estado EN_CORRECCION. La organización podrá subsanar las observaciones y reenviar su solicitud a revisión.'}
            </p>
          </div>

          {/* Selector de Motivo oficial */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Motivo Oficial del Dictamen <span className="text-rose-500">*</span>
            </label>
            <select
              value={motivoSeleccionado}
              onChange={(e) => setMotivoSeleccionado(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer"
            >
              {opcionesMotivos.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observación / Justificación */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
              Observación para la Organización {motivoSeleccionado === 'OTRO' ? '(Obligatoria)' : ''}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Detalla qué aspectos deben subsanarse (fechas, aforo, permisos, descripción, imágenes) para que la organización pueda corregir y reenviar..."
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-white outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50">
              {error}
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-white ${
                isRechazo
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {loading
                ? 'Procesando...'
                : isRechazo
                ? 'Confirmar Rechazo'
                : 'Solicitar Corrección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
