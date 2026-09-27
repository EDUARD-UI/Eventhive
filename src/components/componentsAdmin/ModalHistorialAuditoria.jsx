import { createPortal } from 'react-dom';
import React from 'react';
import { X, History } from 'lucide-react';

export default function ModalHistorialAuditoria({ titulo = 'Historial de Auditoría', historial = [], onClose }) {
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar max-h-[85vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
              <History className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                {titulo}
              </h3>
              <p className="text-xs text-slate-500">Trazabilidad de moderación y actos administrativos</p>
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

        <div className="mt-5 space-y-4">
          {historial.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No hay registros de auditoría para este recurso.
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {historial.map((h, i) => (
                <div key={i} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#087fea] ring-4 ring-white" />
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">{h.accion}</span>
                      <span className="text-[11px] text-slate-400">{h.fecha}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{h.detalle || h.motivo}</p>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">
                      Autor: <strong className="text-slate-700">{h.autor}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
