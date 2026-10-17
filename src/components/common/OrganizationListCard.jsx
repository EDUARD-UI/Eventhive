import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiUserCheck, FiUserPlus, FiCheck, FiAward } from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';

/**
 * OrganizationListCard
 * Tarjeta horizontal de Organización estilo feed (basada en la imagen de referencia):
 * - Imagen a la izquierda (thumbnail redondeado generoso).
 * - Lado derecho:
 *   - Badge superior de categoría / tipo.
 *   - Título de la organización en negrita.
 *   - Descripción resumida.
 *   - Nombre del representante con avatar/ícono.
 *   - Solo botones: Seguir y Ver.
 */
export default function OrganizationListCard({ org }) {
  if (!org) return null;

  const {
    id,
    name,
    razonSocial,
    representante,
    avatar,
    logo,
    imagen,
    urlLogo,
    imagenPerfil,
    description,
    descripcion,
    category,
    categoria,
    verified,
    estado,
  } = org;

  const [isFollowing, setIsFollowing] = useState(false);

  const title = razonSocial || name || 'Organización';
  const desc = descripcion || description || 'Organización cultural y productora de eventos en Cartagena de Indias.';
  const repName = representante || org.nombreRepresentante || 'Representante oficial';
  const imgUrl = urlLogo || imagenPerfil || avatar || logo || imagen || null;
  const orgCategory = (typeof categoria === 'object' ? categoria?.nombre : categoria) || category || 'Organización';
  const isVerified = verified || estado === 'APROBADA' || estado === 'VERIFICADA';

  const handleFollowToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing((prev) => !prev);
  };

  return (
    <article className="group relative bg-white dark:bg-[#0D1527] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center shadow-md hover:shadow-xl hover:border-amber-400/60 dark:hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden">
      
      {/* 1. IMAGEN / LOGO A LA IZQUIERDA */}
      <Link
        to={`/organizaciones/${id}`}
        className="w-full sm:w-36 md:w-44 h-44 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200/70 dark:border-slate-800/80 relative block group/img"
      >
        <ImageWithFallback
          src={imgUrl}
          alt={title}
          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 ease-out"
          fallbackText={title}
          iconSize={32}
        />
        {isVerified && (
          <span
            title="Organización Verificada"
            className="absolute top-2.5 right-2.5 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md text-xs"
          >
            <FiCheck size={12} strokeWidth={3} />
          </span>
        )}
      </Link>

      {/* 2. CUERPO: TÍTULO, DESCRIPCIÓN Y NOMBRE DEL REPRESENTANTE */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        <div>

          {/* Título de la organización */}
          <Link to={`/organizaciones/${id}`} className="block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            <h3 className="font-black text-slate-950 dark:text-white text-base sm:text-lg md:text-xl tracking-tight leading-snug line-clamp-1 uppercase">
              {title}
            </h3>
          </Link>

          {/* Descripción */}
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {desc}
          </p>
        </div>

        {/* Fila inferior: Nombre del representante */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <FiUserCheck size={13} />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Representante:{' '}
              <strong className="font-bold text-slate-800 dark:text-slate-200">
                {repName}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. SOLO BOTONES SEGUIR / VER (A la derecha en desktop, al pie en móviles) */}
      <div className="flex sm:flex-col items-center justify-center gap-2.5 sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 w-full sm:w-auto">
        {/* Botón Seguir */}
        <button
          type="button"
          onClick={handleFollowToggle}
          className={`w-full sm:w-32 py-2 px-3.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-xs cursor-pointer ${
            isFollowing
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          {isFollowing ? <FiCheck size={14} strokeWidth={2.5} /> : <FiUserPlus size={14} />}
          <span>{isFollowing ? 'Siguiendo' : 'Seguir'}</span>
        </button>

        {/* Botón Ver */}
        <Link
          to={`/organizaciones/${id}`}
          className="w-full sm:w-32 py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 border border-slate-200/90 dark:border-slate-700/80 text-center"
        >
          <FiEye size={14} />
          <span>Ver</span>
        </Link>
      </div>

    </article>
  );
}
