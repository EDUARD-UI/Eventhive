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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#087fea]">
              <Layers className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <p className="text-xs text-slate-500">Catálogo temático oficial de Eventhive</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
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

          {/* Selector de Archivo para la Fotografía (Requisito 6) */}
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
            <div className="relative h-28 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs">
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

          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-[#087fea] hover:bg-[#0060cc] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Guardando...'
                : categoria
                ? 'Actualizar Categoría'
                : 'Guardar Categoría'}
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
