import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiCheck,
  FiUserPlus,
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
import { showErrorAlert, showLoginAlert } from '../../utils/alertUtils.js';

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
  const initialFollowers = org?.totalSeguidores ?? org?.followers ?? 0;
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(initialFollowers);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

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
    estado,
    rating,
    promedioRating,
    followers,
    totalSeguidores,
    eventsCount,
    totalEventosCreados,
  } = org;

  const title = razonSocial || name || 'Organización';
  const desc = descripcion || description || 'Organización cultural y productora de experiencias en Cartagena de Indias.';
  const repName = representante || org.nombreRepresentante || '';
  const imgUrl = urlLogo || imagenPerfil || avatar || logo || imagen || null;
  const displayRating = promedioRating ?? rating ?? null;
  const totalEvents = totalEventosCreados ?? eventsCount ?? 0;
  const currentUser = session.getUser();
  const currentUserOrganizationId =
    currentUser?.organizacionId ??
    currentUser?.organizationId ??
    currentUser?.organizacion?.id ??
    currentUser?.organization?.id;
  const representativeId =
    org.representante?.id ?? org.representanteId ?? org.representanteLegalId;
  const isOwnOrganization = Boolean(
    currentUser &&
      ((currentUserOrganizationId && String(currentUserOrganizationId) === String(id)) ||
        (currentUser.id && representativeId && String(currentUser.id) === String(representativeId)))
  );

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

    if (isLoadingFollow || isOwnOrganization) return;
    setIsLoadingFollow(true);

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
      setIsFollowing(!nextState);
      setFollowersCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      await showErrorAlert({
        title: 'No se pudo actualizar el seguimiento',
        text: err.message || 'Intenta de nuevo más tarde.',
      });
    } finally {
      setIsLoadingFollow(false);
    }
  };

  return (
    <article className="group relative bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 hover:border-amber-400/50 dark:hover:border-amber-400/40 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden">
      {/* 1. CUERPO DE LA TARJETA: ESTADO, LOGO, TÍTULO Y DESCRIPCIÓN */}
      <div className="relative px-5 sm:px-6 py-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header con Rating o Ubicación */}
          <div className="flex items-center justify-end gap-2 mb-4">
            {displayRating ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                <FiStar size={11} fill="currentColor" />
                <span>{Number(displayRating).toFixed(1)}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                <FiMapPin size={10} className="text-amber-500" />
                <span>Cartagena</span>
              </span>
            )}
          </div>

          {/* Fila del Logo solapado y Botón Seguir */}
          <div className="flex items-end justify-between gap-3 mb-3">
            <Link
              to={`/organizaciones/${id}`}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white dark:bg-[#070D1B] border-3 border-white dark:border-[#0E1626] shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0 block"
              aria-label={`Ver perfil de ${title}`}
            >
              <ImageWithFallback
                src={imgUrl}
                alt={title}
                className="w-full h-full object-cover"
                fallbackText={title}
                iconSize={34}
              />
            </Link>

            {/* Botón interactivo 'Seguir' estilo EventDetailPage dorado ámbar */}
            {!isOwnOrganization && <button
              type="button"
              disabled={isLoadingFollow}
              onClick={handleFollowToggle}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 shadow-xs disabled:opacity-75 disabled:cursor-not-allowed ${
                isFollowing
                  ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/10'
              }`}
            >
              {isLoadingFollow ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{isFollowing ? 'Dejando...' : 'Siguiendo...'}</span>
                </>
              ) : isFollowing ? (
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
            </button>}
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
