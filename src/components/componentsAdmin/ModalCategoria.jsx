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
        data-lenis-prevent="true"
        className="relative z-50 w-full sm:w-[480px] md:w-[520px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] overflow-y-auto animate-in slide-in-from-right duration-250 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header del drawer */}
          <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#0F2342] text-white p-5 sm:p-6">
            <div>
              <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <p className="font-mono text-xs text-slate-300 mt-0.5">
                Clasificación oficial de eventos en plataforma
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Formulario */}
          <form id="categoria-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-[2px] bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                Nombre de la Categoría <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={60}
                placeholder="Ej: Festivales, Conciertos, Teatro..."
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors"
              />
            </div>

            {/* Zona de Subida de Fotografía */}
            <div>
              <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                Fotografía Representativa
              </label>
              <div className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#0F2342] rounded-[2px] p-5 text-center cursor-pointer transition-colors bg-[#F8F9FA]">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-[2px] bg-white border border-[#E2E8F0] text-[#0F2342] flex items-center justify-center shadow-2xs">
                    <Upload className="w-5 h-5 text-[#0F2342]" />
                  </div>
                  <p className="text-xs font-mono font-bold text-[#0F2342]">
                    {fotoFile ? fotoFile.name : 'Haz clic o arrastra una imagen aquí'}
                  </p>
                  <p className="text-[10px] font-mono text-[#64748B]">
                    PNG, JPG o WEBP (máx. 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Previsualización */}
            {previewUrl ? (
              <div className="relative h-32 rounded-[2px] overflow-hidden bg-[#0F2342] border border-[#E2E8F0] shadow-2xs">
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-white">
                  <span className="font-display font-black text-xs uppercase tracking-tight block drop-shadow-md">
                    {nombre || 'Nombre de la categoría'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-300">
                    {fotoFile ? 'Nueva imagen seleccionada' : 'Imagen actual en plataforma'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-20 rounded-[2px] bg-[#F8F9FA] border border-dashed border-[#E2E8F0] flex items-center justify-center text-[#64748B] font-mono text-xs gap-2">
                <ImageIcon className="w-4 h-4 text-[#64748B]" />
                <span>Sin fotografía seleccionada</span>
              </div>
            )}
          </form>
        </div>

        {/* Footer fijo del drawer */}
        <div className="p-5 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] font-mono text-xs uppercase tracking-wider font-bold text-[#64748B] hover:bg-[#F8F9FA] transition-colors"
          >
            Cancelar
          </button>
          <button
            form="categoria-drawer-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#F5B800] text-white hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
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
