import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiUserPlus,
  FiAward,
  FiStar,
  FiUsers,
  FiCalendar,
  FiUserCheck,
  FiArrowRight,
  FiMapPin,
} from 'react-icons/fi';
import ImageWithFallback from './ImageWithFallback.jsx';
import { session } from '../../services/session.js';
import { organizationService } from '../../services/organizerService.js';
import { showLoginAlert } from '../../utils/alertUtils.js';

/**
 * OrganizationListCard
 * Tarjeta de Organización estilo Showcase / Directorio Moderno:
 * - Cover banner decorativo superior con textura geométrica sutil y glow ambiental.
 * - Badges flotantes: Categoría cultural a la izquierda y Estado Verificado / Rating a la derecha.
 * - Logo / Avatar flotante con solapamiento limpio sobre el banner.
 * - Botón de acción interactivo "Seguir / Siguiendo" tipo pill con sincronización de estado.
 * - Tipografía jerárquica con nombre de organización y representante oficial.
 * - Barra inferior con métricas (seguidores, eventos) y enlace de exploración sutil.
 */
export default function OrganizationListCard({ org }) {
  const navigate = useNavigate();
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
    rating,
    promedioRating,
    followers,
    totalSeguidores,
    eventsCount,
    totalEventosCreados,
  } = org;

  const [isFollowing, setIsFollowing] = useState(false);
  const initialFollowers = totalSeguidores ?? followers ?? 0;
  const [followersCount, setFollowersCount] = useState(initialFollowers);

  const title = razonSocial || name || 'Organización';
  const desc = descripcion || description || 'Organización cultural y productora de experiencias en Cartagena de Indias.';
  const repName = representante || org.nombreRepresentante || '';
  const imgUrl = urlLogo || imagenPerfil || avatar || logo || imagen || null;
  const orgCategory = (typeof categoria === 'object' ? categoria?.nombre : categoria) || category || 'Cultura & Arte';
  const isVerified = verified || estado === 'APROBADA' || estado === 'VERIFICADA';
  const displayRating = promedioRating ?? rating ?? null;
  const totalEvents = totalEventosCreados ?? eventsCount ?? 0;

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = session.getToken();
    if (!token) {
      showLoginAlert({
        navigate,
        text: 'Inicia sesión para seguir organizaciones y estar al día con sus nuevos eventos en cartelera.',
      });
      return;
    }

    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (nextState) {
        await organizationService.followOrganization(id);
      } else {
        await organizationService.unfollowOrganization(id);
      }
    } catch (err) {
      console.warn('Error al actualizar estado de seguimiento:', err);
      // Revertir en caso de falla
      setIsFollowing(!nextState);
      setFollowersCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  return (
    <article className="group relative bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400/50 dark:hover:border-amber-400/40 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden">
      {/* 1. COVER BANNER SUPERIOR CON TEXTURA Y GLOW AMBIENTAL */}
      <div className="relative h-24 sm:h-28 w-full bg-gradient-to-r from-slate-900 via-[#101A2E] to-slate-950 overflow-hidden shrink-0">
        {/* Patrón de puntos geométricos sutiles */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:14px_14px]"
        />
        {/* Glow cálido ambiental en la esquina */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:bg-amber-400/30 transition-all duration-500"
        />

        {/* Badges superiores alineados en extremos */}
        <div className="relative z-10 p-3 sm:p-3.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            <FiAward size={11} className="text-amber-400 shrink-0" />
            <span className="truncate max-w-[130px]">{orgCategory}</span>
          </span>

          {isVerified ? (
            <span
              title="Organización verificada en EventHive"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider"
            >
              <FiCheck size={11} strokeWidth={3} />
              <span>Verificada</span>
            </span>
          ) : displayRating ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-bold">
              <FiStar size={11} fill="currentColor" />
              <span>{Number(displayRating).toFixed(1)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-slate-300 text-[10px] font-medium">
              <FiMapPin size={10} className="text-amber-400" />
              <span>Cartagena</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. CUERPO DE LA TARJETA: LOGO FLOTANTE, TÍTULO, REPRESENTANTE Y DESCRIPCIÓN */}
      <div className="relative px-5 sm:px-6 pb-5 pt-0 flex-1 flex flex-col justify-between -mt-9">
        <div>
          {/* Fila del Logo solapado y Botón Seguir */}
          <div className="flex items-end justify-between gap-3 mb-3">
            <Link
              to={`/organizaciones/${id}`}
              className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white dark:bg-[#070D1B] border-3 border-white dark:border-[#0E1626] shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 block"
              aria-label={`Ver perfil de ${title}`}
            >
              <ImageWithFallback
                src={imgUrl}
                alt={title}
                className="w-full h-full object-cover"
                fallbackText={title}
                iconSize={26}
              />
            </Link>

            {/* Botón interactivo 'Seguir' tipo pill estilizado */}
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs active:scale-95 ${
                isFollowing
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500'
              }`}
            >
              {isFollowing ? (
                <>
                  <FiCheck size={13} strokeWidth={2.5} />
                  <span>Siguiendo</span>
                </>
              ) : (
                <>
                  <FiUserPlus size={13} />
                  <span>Seguir</span>
                </>
              )}
            </button>
          </div>

          {/* Nombre de la organización */}
          <Link to={`/organizaciones/${id}`} className="block group/title">
            <h3 className="font-display font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight line-clamp-1 group-hover/title:text-amber-600 dark:group-hover/title:text-amber-400 transition-colors">
              {title}
            </h3>
          </Link>

          {/* Representante oficial */}
          {repName && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <FiUserCheck size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">
                Por <strong className="font-semibold text-slate-700 dark:text-slate-300">{repName}</strong>
              </span>
            </div>
          )}

          {/* Descripción sintetizada */}
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {desc}
          </p>
        </div>

        {/* 3. FOOTER DE LA TARJETA: CHIPS DE MÉTRICAS Y ENLACE DE ACCESO */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          {/* Métricas con iconos sutiles */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold" title="Seguidores de la organización">
              <FiUsers size={12} className="text-slate-400 dark:text-slate-500" />
              <span>{followersCount}</span>
            </span>

            {totalEvents > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold" title="Eventos creados">
                <FiCalendar size={12} className="text-slate-400 dark:text-slate-500" />
                <span>{totalEvents} {totalEvents === 1 ? 'evento' : 'eventos'}</span>
              </span>
            )}
          </div>

          {/* Enlace 'Ver perfil' con microinteracción de flecha */}
          <Link
            to={`/organizaciones/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 group/link transition-colors cursor-pointer"
          >
            <span>Ver perfil</span>
            <FiArrowRight size={13} className="transition-transform duration-200 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
