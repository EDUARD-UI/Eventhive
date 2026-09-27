import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Layers, Sparkles } from 'lucide-react';

const PRESETS = [
  { label: 'Música & Conciertos', url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80' },
  { label: 'Cultura & Patrimonio', url: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gastronomía Caribeña', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Deportes de Playa', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80' },
  { label: 'Congresos & Cátedras', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80' },
];

export default function ModalCategoria({ categoria, onClose, onSave }) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [desc, setDesc] = useState(categoria?.desc || '');
  const [foto, setFoto] = useState(
    categoria?.foto || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSave({
      id: categoria?.id || Date.now(),
      nombre,
      desc: desc || 'Eventos y experiencias en Cartagena de Indias.',
      foto,
      eventos: categoria?.eventos || 0,
      activa: categoria?.activa ?? true,
    });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto no-scrollbar overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
              <Layers className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                {categoria ? 'Editar Categoría' : 'Crear Nueva Categoría'}
              </h3>
              <p className="text-xs text-slate-500">Catálogo temático de la plataforma</p>
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
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Festivales Folclóricos"
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Descripción Breve
            </label>
            <textarea
              rows={2}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Breve reseña que aparecerá en el explorador de eventos..."
              className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              URL de Foto de Portada
            </label>
            <input
              type="url"
              required
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs font-mono px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] transition-all"
            />

            <p className="text-[11px] text-slate-400 font-semibold mt-2 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Presets recomendados para Cartagena:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFoto(p.url)}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-[#087fea] text-slate-600 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-24 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
            <img src={foto} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute bottom-2 left-3 text-white font-display font-bold text-xs truncate">
              {nombre || 'Nombre de la categoría'}
            </span>
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
              {categoria ? 'Actualizar Categoría' : 'Guardar Categoría'}
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
