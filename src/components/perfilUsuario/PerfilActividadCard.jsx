import React from 'react';
import { FiBookmark, FiShoppingBag, FiCalendar } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext.jsx';

export default function PerfilActividadCard({
  guardadosCount = 0,
  boletosCount = 0,
  eventosCount = 0,
}) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm p-6 space-y-5 transition-all duration-300">
      <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
        {t('ACTIVIDAD')}
      </span>

      <div className="space-y-4">
        {/* Item 1: Experiencias guardadas */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 bg-amber-50/50 dark:bg-amber-500/10 shadow-2xs">
            <FiBookmark size={18} />
          </div>
          <div>
            <strong className="block text-lg font-black text-slate-900 dark:text-white leading-none">
              {guardadosCount}
            </strong>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('experiencias guardadas')}
            </span>
          </div>
        </div>

        {/* Item 2: Boletos adquiridos */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 bg-amber-50/50 dark:bg-amber-500/10 shadow-2xs">
            <FiShoppingBag size={18} />
          </div>
          <div>
            <strong className="block text-lg font-black text-slate-900 dark:text-white leading-none">
              {boletosCount}
            </strong>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('boletos adquiridos')}
            </span>
          </div>
        </div>

        {/* Item 3: Eventos confirmados */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl border border-amber-200 dark:border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0 bg-amber-50/50 dark:bg-amber-500/10 shadow-2xs">
            <FiCalendar size={18} />
          </div>
          <div>
            <strong className="block text-lg font-black text-slate-900 dark:text-white leading-none">
              {eventosCount}
            </strong>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('eventos confirmados')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
