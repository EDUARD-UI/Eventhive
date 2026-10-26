import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiCompass, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import PerfilOrganizacionCard from '../../../components/perfilUsuario/PerfilOrganizacionCard.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export default function OrganizacionesPartial({
  organizacionesSeguidas = [],
  organizacionesDisponibles = [],
  organizaciones = [],
  onFollow,
  onUnfollow,
}) {
  const { t } = useLanguage();

  // Compatibilidad: si se pasó organizaciones directamente
  const followedList = organizacionesSeguidas.length > 0 ? organizacionesSeguidas : organizaciones;
  const hasFollowed = followedList.length > 0;
  const hasAvailable = organizacionesDisponibles.length > 0;

  // Si no hay ninguna en absoluto
  if (!hasFollowed && !hasAvailable) {
    return (
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-200/80 dark:border-amber-500/20">
          <FiUsers size={22} />
        </div>
        <h4 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white mb-1">
          {t('No hay organizaciones disponibles') || 'No hay organizaciones disponibles'}
        </h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          {t('Pronto se sumarán más organizadores y productores culturales a EventHive.') ||
            'Pronto se sumarán más organizadores y productores culturales a EventHive.'}
        </p>
        <Link
          to="/organizaciones"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
        >
          <span>{t('Explorar Organizaciones') || 'Explorar Organizaciones'}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. SECCIÓN: Organizaciones que sigues */}
      {hasFollowed ? (
        <div>
          

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {followedList.map((org) => (
              <PerfilOrganizacionCard
                key={org.id}
                organizacion={org}
                isFollowing={true}
                onUnfollow={onUnfollow}
                onFollow={onFollow}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Banner Descubrimiento cuando el usuario no sigue a nadie */
        <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 dark:from-amber-950/20 dark:via-[#0E1626] dark:to-slate-900/40 rounded-3xl border border-amber-200/80 dark:border-amber-500/20 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <FiCompass size={28} />
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h4 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">
              {t('Aún no sigues a ninguna organización')}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {t(
                'Comienza a seguir a las productoras culturales de Cartagena para recibir notificaciones de nuevos eventos y lanzamientos exclusivos de boletería.'
              )}
            </p>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: Organizaciones para descubrir / comenzar a seguir */}
      {hasAvailable && (
        <div className={hasFollowed ? 'pt-4 border-t border-slate-200 dark:border-slate-800' : ''}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                {hasFollowed ? t('Descubrir más organizaciones') : t('Organizaciones que puedes seguir')}
              </h3>
            </div>
            <Link
              to="/organizaciones"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>{t('Explorar todas')}</span>
              <FiArrowRight size={4} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {organizacionesDisponibles.slice(0, 4).map((org) => (
              <PerfilOrganizacionCard
                key={org.id}
                organizacion={org}
                isFollowing={false}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
