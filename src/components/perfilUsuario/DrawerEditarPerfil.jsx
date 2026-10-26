import React from 'react';
import { FiX, FiEdit2, FiCamera } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext.jsx';

const getInitials = (name = '') => {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function DrawerEditarPerfil({
  isOpen,
  onClose,
  usuario,
  setUsuario,
  fileInputRef,
  photoPreview,
  selectedPhotoFile,
  isUpdating,
  onSubmit,
  onPhotoSelect,
}) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop con blur */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Lateral Derecho */}
      <div
        className="relative z-50 w-full sm:w-[460px] bg-white dark:bg-[#0E1626] h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Encabezado del Drawer */}
          <div className="bg-slate-900 dark:bg-[#0A1222] text-white p-5 relative border-b border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title={t('Cerrar')}
            >
              <FiX size={16} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
                <FiEdit2 size={16} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {t('Editar Perfil de Cliente')}
                </h3>
                <p className="text-xs text-slate-300">
                  {t('Actualiza tu información personal y foto de perfil')}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario Unificado */}
          <form onSubmit={onSubmit} id="cliente-perfil-form" className="p-5 sm:p-6 space-y-5">
            {/* Sección de Foto de Perfil */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div className="relative group mb-2.5">
                <div className="w-20 h-20 rounded-full border-2 border-slate-200 dark:border-slate-700 p-0.5 shadow-xs overflow-hidden bg-white dark:bg-slate-950">
                  {photoPreview || usuario.urlImagenPerfil ? (
                    <img
                      src={photoPreview || usuario.urlImagenPerfil}
                      alt={usuario.nombreCompleto}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-400 text-xl font-bold select-none">
                      {getInitials(usuario.nombreCompleto)}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-md border-2 border-white dark:border-slate-900 cursor-pointer"
                  title={t('Cambiar foto de perfil')}
                >
                  <FiCamera size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white underline cursor-pointer"
              >
                {selectedPhotoFile ? t('Cambiar selección de foto') : t('Subir o cambiar foto de perfil')}
              </button>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG o JPEG (máx. 5 MB).
              </p>
            </div>

            {/* Datos de Texto */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('Nombre Completo *')}
                </label>
                <input
                  type="text"
                  value={usuario.nombreCompleto}
                  onChange={(e) => setUsuario({ ...usuario, nombreCompleto: e.target.value })}
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t('Correo Electrónico')}
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {t('Solo Lectura')}
                  </span>
                </div>
                <input
                  type="email"
                  value={usuario.correo}
                  disabled
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('Teléfono Celular (Máx. 10 dígitos)')}
                </label>
                <input
                  type="tel"
                  value={usuario.telefono}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setUsuario({ ...usuario, telefono: cleaned });
                  }}
                  maxLength={10}
                  placeholder="Ej: 3001234567"
                  className="w-full text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-amber-400 focus:ring-2 focus:ring-slate-900/10 transition-all"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Pie del Drawer con Acciones */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('Cancelar')}
          </button>
          <button
            type="submit"
            form="cliente-perfil-form"
            disabled={isUpdating}
            className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-60"
          >
            {isUpdating && (
              <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
            )}
            <span>{t('Guardar Cambios')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
