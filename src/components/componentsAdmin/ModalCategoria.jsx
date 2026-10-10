import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { X, Layers, Upload, Image as ImageIcon } from 'lucide-react';

export default function ModalCategoria({ categoria, onClose, onSave }) {
  const [nombre, setNombre] = useState(categoria?.nombre || '');
  const [fotoFile, setFotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    categoria?.imagenUrl || categoria?.foto || categoria?.urlFoto || null
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
        return;
      }
      setError('');
      setFotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        id: categoria?.id,
        nombre: nombre.trim(),
        fotoFile,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer lateral derecho */}
      <div
        className="relative z-50 w-full sm:w-[480px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-[#131b2e] text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-amber-400">
                <Layers className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white leading-tight">
                  {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <p className="text-xs text-slate-300">Catálogo temático oficial de Eventhive</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>

          <form id="categoria-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {error}
              </div>
            )}

            {/* Nombre de la categoría (Sin campo de descripción) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Festivales y Conciertos"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 transition-all"
              />
            </div>

            {/* Selector de Archivo para la Fotografía */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Fotografía de la Categoría
              </label>
              <div className="relative border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    {fotoFile ? fotoFile.name : 'Haz clic o arrastra una imagen aquí'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PNG, JPG o WEBP (el almacenamiento y URL serán generados por el backend)
                  </p>
                </div>
              </div>
            </div>

            {/* Previsualización de la Imagen */}
            {previewUrl ? (
              <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="font-display font-bold text-xs block drop-shadow-md">
                    {nombre || 'Nombre de la categoría'}
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {fotoFile ? 'Nueva imagen seleccionada' : 'Imagen actual proporcionada por backend'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-20 rounded-2xl bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>Sin fotografía seleccionada</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer fijo del drawer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="categoria-drawer-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Guardando...'
              : categoria
              ? 'Actualizar Categoría'
              : 'Guardar Categoría'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
