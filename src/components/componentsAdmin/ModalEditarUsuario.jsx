import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, UserCog, Check, Ban } from 'lucide-react';

export default function ModalEditarUsuario({ usuario, onClose, onSave }) {
  const [rol, setRol] = useState(usuario?.rol || 'CLIENTE');
  const [activo, setActivo] = useState(usuario?.activo ?? true);

  if (!usuario) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(usuario.id, { rol, activo });
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
            <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
              <UserCog className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                Gestionar Usuario
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{usuario.nombre}</p>
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
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <p className="text-slate-400">Correo Electrónico:</p>
            <p className="font-semibold text-slate-800">{usuario.correo}</p>
            {usuario.organizacion && (
              <p className="text-[11px] text-[#087fea] mt-1 font-medium">
                Vinculado a: <strong>{usuario.organizacion}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Rol del Sistema (Regla de Autorización) *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#087fea] transition-all cursor-pointer"
            >
              <option value="CLIENTE">CLIENTE — Asistente y comprador</option>
              <option value="REPRESENTANTE">REPRESENTANTE — Responsable de organización</option>
              <option value="OPERADOR">OPERADOR — Personal operativo de organización</option>
              <option value="MODERADOR">MODERADOR — Auditor de contenido y PULEP</option>
              <option value="ADMINISTRADOR">ADMINISTRADOR — Control general de plataforma</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Estado de la Cuenta (Desactivación Lógica)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActivo(true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activo
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Activo</span>
              </button>

              <button
                type="button"
                onClick={() => setActivo(false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  !activo
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Ban className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Bloqueado</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Las cuentas bloqueadas preservan su historial de compras y tiquetes para auditoría.
            </p>
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
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
