import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const TABS = [
  { id: 'guardados', label: 'GUARDADOS' },
  { id: 'entradas', label: 'MIS BOLETOS' },
  { id: 'organizaciones', label: 'ORGANIZACIONES' },
  { id: 'historial', label: 'HISTORIAL' },
  { id: 'seguridad', label: 'CONFIGURACIÓN' },
];

export default function PerfilTabs({
  activeTab,
  onTabChange,
  guardadosCount = 0,
  organizacionesCount = 0,
  historialCount = 0,
  boletosCount = 0,
}) {
  const { t } = useLanguage();

  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'guardados':
        return guardadosCount;
      case 'organizaciones':
        return organizacionesCount > 0 ? organizacionesCount : null;
      case 'historial':
        return historialCount > 0 ? historialCount : null;
      case 'entradas':
        return boletosCount;
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-1">
      {/* Contenedor Flotante Estilo Cápsula con Relleno Blanco y Borde Sobrio */}
      <nav
        aria-label="Pestañas de perfil"
        className="inline-flex items-center gap-1 sm:gap-2 p-1.5 bg-white dark:bg-[#0E1626] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm min-w-max transition-all"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = getTabCount(tab.id);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-black tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-bold'
              }`}
            >
              <span>{t(tab.label)}</span>
              {count !== null && count > 0 && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-slate-950 text-amber-300'
                      : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
