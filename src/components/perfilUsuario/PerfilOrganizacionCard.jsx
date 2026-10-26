import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreHorizontal, FiUser, FiUsers, FiExternalLink, FiPlus, FiUserCheck, FiUserX } from 'react-icons/fi';
import ImageWithFallback from '../common/ImageWithFallback.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function PerfilOrganizacionCard({
  organizacion,
  isFollowing = true,
  onFollow,
  onUnfollow,
}) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);

  if (!organizacion) return null;

  const {
    id,
    name,
    razonSocial,
    nombre,
    representante,
    nombreRepresentante,
    urlLogo,
    imagenPerfil,
    logo,
    imagen,
    foto,
    category,
    categoria,
    followers,
    totalSeguidores,
    seguidores,
  } = organizacion;

  const orgName = name || razonSocial || nombre || 'Organización';
  const repName = representante || nombreRepresentante || t('Representante no especificado') || 'Representante';
  const orgLogo = urlLogo || imagenPerfil || logo || imagen || foto;
  const orgCategory = category || (typeof categoria === 'object' ? categoria?.nombre : categoria) || 'Cultura';
  const followersCount = totalSeguidores ?? followers ?? seguidores ?? 0;

  return (
    <article className="bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-center flex flex-col items-center justify-between shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative group">
      {/* Botón sutil de tres puntos superior derecho */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          aria-label="Opciones de organización"
          aria-expanded={showMenu}
          onClick={() => setShowMenu((isOpen) => !isOpen)}
          className="w-7 h-7 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <FiMoreHorizontal size={14} />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 min-w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1626] p-1.5 shadow-xl z-20 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <Link
              to={`/organizaciones/${id}`}
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FiExternalLink size={13} className="text-amber-500" />
              <span>{t('Ver perfil')}</span>
            </Link>

            {isFollowing ? (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onUnfollow?.(organizacion);
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors"
              >
                <FiUserX size={13} />
                <span>{t('Dejar de seguir')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  onFollow?.(organizacion);
                }}
                className="flex items-center gap-2 w-full rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 transition-colors"
              >
                <FiPlus size={13} />
                <span>{t('Seguir')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. Logo / Imagen Circular de la Organización */}
      <Link to={`/organizaciones/${id}`} className="block relative my-1">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 group-hover:border-amber-400/60 shadow-sm mx-auto transition-colors bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          {orgLogo ? (
            <img
              src={orgLogo}
              alt={orgName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-slate-800 to-amber-600 flex items-center justify-center text-white text-xl sm:text-2xl font-black select-none">
              {orgName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      {/* 2. Información: Nombre de Organización y Nombre de Representante */}
      <div className="w-full my-2">
        <Link to={`/organizaciones/${id}`} className="block">
          <h3
            className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors"
            title={orgName}
          >
            {orgName}
          </h3>
        </Link>

        {/* Nombre del Representante (Requerido) */}
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate flex items-center justify-center gap-1.5" title={repName}>
          <FiUser size={12} className="shrink-0 text-amber-500" />
          <span className="truncate">{repName}</span>
        </p>
      </div>

      {/* 3. Barra Inferior con Seguidores y Botón de Acción */}
      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800/80 w-full flex flex-col items-center gap-2.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <FiUsers size={13} className="text-amber-500" />
          <span>{followersCount} {t('seguidores') || 'seguidores'}</span>
        </div>

        {/* Botón de Seguir / Dejar de seguir */}
        {isFollowing ? (
          <button
            type="button"
            onClick={() => onUnfollow?.(organizacion)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:border-red-900/60 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FiUserCheck size={13} className="text-emerald-500 group-hover:text-red-500" />
            <span>{t('Dejar de seguir')}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onFollow?.(organizacion)}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <FiPlus size={14} />
            <span>{t('Seguir')}</span>
          </button>
        )}
      </div>
    </article>
  );
}
