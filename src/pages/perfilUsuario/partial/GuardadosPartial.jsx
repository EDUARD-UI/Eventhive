import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiArrowRight } from 'react-icons/fi';
import PerfilEventCard from '../../../components/perfilUsuario/PerfilEventCard.jsx';
import { useLanguage } from '../../../context/LanguageContext.jsx';

export default function GuardadosPartial({ guardados = [], onRemoveDeseo }) {
  const { t } = useLanguage();

  if (guardados.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0E1626] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 sm:p-14 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5 border border-amber-200/80 dark:border-amber-500/20">
          <FiBookmark size={22} />
        </div>
        <h4 className="font-extrabold text-base sm:text-lg text-slate-950 dark:text-white mb-1">
          {t('No tienes eventos guardados en favoritos')}
        </h4>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
          {t('Explora la cartelera cultural de Cartagena de Indias y guarda tus favoritos.')}
        </p>
        <Link
          to="/buscar"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all active:scale-95"
        >
          <span>{t('Explorar Experiencias')}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {guardados.map((evento) => (
        <PerfilEventCard
          key={evento.id}
          event={evento}
          showFavoriteButton={true}
          onRemoveFavorite={onRemoveDeseo}
        />
      ))}
    </div>
  );
}
