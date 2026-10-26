import React from 'react';
import { FiCamera, FiEdit2, FiUpload, FiX } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext.jsx';

const getInitials = (name = '') => {
  if (!name.trim()) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function PerfilHeaderCard({
  usuario,
  fileInputRef,
  photoPreview,
  selectedPhotoFile,
  isUploadingPhoto,
  onPhotoSelect,
  onUploadPhoto,
  onCancelPhoto,
  onOpenEditModal,
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col items-center text-center relative transition-all duration-300 overflow-hidden">
      {/* 1. Línea Superior de Destello Dorado Elegante */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 dark:via-amber-400 to-transparent shadow-[0_0_12px_rgba(245,158,11,0.7)] pointer-events-none z-10"
      />

      {/* 2. Capa de Destellos y Auras Doradas Notorias (Light y Dark) */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {/* Halo dorado central */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-88 h-48 rounded-full bg-gradient-to-b from-amber-400/30 via-amber-500/15 to-transparent dark:from-amber-400/25 dark:via-amber-500/10 blur-2xl" />

        {/* Halo lateral izquierdo */}
        <div className="absolute top-2 left-4 sm:left-10 w-36 h-36 rounded-full bg-amber-300/25 dark:bg-amber-400/20 blur-2xl" />

        {/* Halo lateral derecho */}
        <div className="absolute top-2 right-4 sm:right-10 w-36 h-36 rounded-full bg-amber-400/25 dark:bg-amber-500/20 blur-2xl" />

        {/* Destello 1 (Superior Izquierdo Grande) */}
        <svg
          className="absolute left-6 sm:left-14 top-6 h-6 w-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.85)] animate-pulse"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Destello 2 (Izquierdo Medio) */}
        <svg
          className="absolute left-14 sm:left-28 top-16 h-3.5 w-3.5 text-amber-400 dark:text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.9)] animate-pulse [animation-delay:700ms]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Destello 3 (Superior Derecho Grande) */}
        <svg
          className="absolute right-6 sm:right-14 top-6 h-6 w-6 text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.85)] animate-pulse [animation-delay:1200ms]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Destello 4 (Derecho Medio) */}
        <svg
          className="absolute right-14 sm:right-28 top-16 h-3.5 w-3.5 text-amber-400 dark:text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.9)] animate-pulse [animation-delay:400ms]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Destello 5 (Junto al Avatar - Izquierda) */}
        <svg
          className="absolute left-[calc(50%-68px)] top-9 h-4 w-4 text-amber-400 dark:text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.95)] animate-pulse [animation-delay:900ms]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Destello 6 (Junto al Avatar - Derecha) */}
        <svg
          className="absolute right-[calc(50%-68px)] top-8 h-4 w-4 text-amber-400 dark:text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.95)] animate-pulse [animation-delay:1500ms]"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10 flex w-full flex-col items-center text-center">
        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPhotoSelect}
          className="hidden"
        />

        {/* Avatar circular con halo dorado resplandeciente */}
        <div className="relative mb-3 group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 shadow-[0_0_22px_rgba(245,158,11,0.45)] dark:shadow-[0_0_28px_rgba(245,158,11,0.55)] ring-2 ring-amber-400/60 dark:ring-amber-400/80 overflow-hidden relative bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-200">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {photoPreview || usuario.urlImagenPerfil ? (
                <img
                  src={photoPreview || usuario.urlImagenPerfil}
                  alt={usuario.nombreCompleto}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-xl sm:text-2xl font-black select-none">
                  {getInitials(usuario.nombreCompleto)}
                </div>
              )}
            </div>
          </div>

          {/* Botón flotante para cambiar foto */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title={t('Cambiar foto de perfil')}
            disabled={isUploadingPhoto}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors shadow-md border-2 border-white dark:border-slate-900 cursor-pointer"
          >
            <FiCamera size={13} />
          </button>
        </div>

        {/* Acciones si hay foto pendiente de confirmar */}
        {selectedPhotoFile && (
          <div className="mb-3 flex items-center justify-center gap-2 animate-fade-in">
            <button
              type="button"
              onClick={onUploadPhoto}
              disabled={isUploadingPhoto}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isUploadingPhoto ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiUpload size={12} />
              )}
              <span>{isUploadingPhoto ? t('Subiendo...') : t('Guardar Foto')}</span>
            </button>
            <button
              type="button"
              onClick={onCancelPhoto}
              disabled={isUploadingPhoto}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
            >
              <FiX size={12} />
              <span>{t('Cancelar')}</span>
            </button>
          </div>
        )}

        {/* Nombre del Usuario */}
        <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
          {usuario.nombreCompleto || 'Usuario'}
        </h2>

        {/* Correo Electrónico */}
        <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-medium mt-0.5">
          {usuario.correo || 'usuario@correo.com'}
        </p>

      </div>
    </div>
  );
}
