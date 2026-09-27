import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, ShieldPlus, User, Mail, MapPin } from 'lucide-react';

export default function ModalAsignarModerador({ onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [zona, setZona] = useState('Centro Histórico');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim()) return;
    onSave({
      id: Date.now(),
      nombre,
      correo,
      zona,
      revisiones: 0,
      tiempoPromedio: '0.0 h',
      cargaPendiente: 0,
      activo: true,
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShieldPlus className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                Asignar Nuevo Moderador
              </h3>
              <p className="text-xs text-slate-500">Equipo de control y validación PULEP en Cartagena</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Daniel Salgado Berrocal"
                className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Correo Institucional (@eventhive.co) *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.75} />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="daniel.s@eventhive.co"
                className="w-full text-xs font-medium pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Zona de Supervisión Distrital *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" strokeWidth={1.75} />
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full text-xs font-semibold pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all cursor-pointer"
              >
                <option value="Centro Histórico">Centro Histórico</option>
                <option value="Getsemaní / San Diego">Getsemaní / San Diego</option>
                <option value="Bocagrande / Manga">Bocagrande / Manga</option>
                <option value="Zona Norte / Boquilla">Zona Norte / Boquilla</option>
                <option value="Pie de la Popa / Mamonal">Pie de la Popa / Mamonal</option>
              </select>
            </div>
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
              className="flex-1 py-2.5 rounded-xl bg-[#087fea] hover:bg-[#0060cc] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Asignar Moderador
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
