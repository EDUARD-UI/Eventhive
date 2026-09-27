import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Ban, ShieldAlert } from 'lucide-react';

export default function ModalSuspenderOrganizacion({ organizacion, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('Incumplimiento de normativas de salubridad y seguridad');
  const [detalle, setDetalle] = useState('');

  if (!organizacion) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!detalle.trim()) return;
    onConfirm(organizacion.id, `${motivo}: ${detalle}`);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                Suspender Organización
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">
                {organizacion.nombreComercial || organizacion.razonSocial}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
            <strong>Atención:</strong> La suspensión de una organización es una medida administrativa justificada. Esta acción dejará trazabilidad en la auditoría y pausará preventivamente la visibilidad de sus eventos.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Motivo Administrativo *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#087fea] transition-all cursor-pointer"
            >
              <option value="Incumplimiento de normativas de salubridad y seguridad">
                Incumplimiento de normativas de salubridad y seguridad
              </option>
              <option value="Falta de plan de contingencia distrital o pólizas requeridas">
                Falta de plan de contingencia distrital o pólizas requeridas
              </option>
              <option value="Irregularidades en documentación tributaria o NIT">
                Irregularidades en documentación tributaria o NIT
              </option>
              <option value="Quejas reiteradas y alteración del orden público">
                Quejas reiteradas y alteración del orden público
              </option>
              <option value="Decisión administrativa de la Secretaría Distrital">
                Decisión administrativa de la Secretaría Distrital
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Justificación Detallada de la Sanción *
            </label>
            <textarea
              required
              rows={4}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Indica con precisión las causas que motivan la suspensión administrativa y los actos oficiales o quejas vinculadas..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 inline-flex items-center justify-center gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Confirmar Suspensión</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
