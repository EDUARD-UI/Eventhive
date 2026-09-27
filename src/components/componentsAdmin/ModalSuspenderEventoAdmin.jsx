import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Ban, ShieldAlert } from 'lucide-react';

export default function ModalSuspenderEventoAdmin({ evento, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('Incumplimiento de plan de contingencia distrital');
  const [observacion, setObservacion] = useState('');

  if (!evento) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!observacion.trim()) return;
    onConfirm(evento.id, observacion, motivo);
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
                Retirar o Suspender Evento
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[260px]">{evento.titulo}</p>
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
            <strong>Facultad Administrativa:</strong> Como Administrador puedes retirar de la cartelera pública eventos que incumplan el código PULEP, alteren el orden público o violen las normas de aforo.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Motivo Administrativo
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#087fea] transition-all cursor-pointer"
            >
              <option value="VIOLACION_POLITICA">VIOLACION_POLITICA — Incumplimiento de términos o normas distritales</option>
              <option value="DOCUMENTACION_INVALIDA">DOCUMENTACION_INVALIDA — Permisos PULEP o de bomberos no vigentes</option>
              <option value="INFORMACION_INSUFICIENTE">INFORMACION_INSUFICIENTE — Inconsistencias de aforo o seguridad</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Justificación de la Suspensión *
            </label>
            <textarea
              required
              rows={4}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Explica las razones que motivan el retiro del evento de la cartelera pública..."
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
              <span>Suspender Evento</span>
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
