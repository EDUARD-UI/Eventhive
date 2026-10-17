import React from 'react';

export default function OrganizationCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-[#0D1527] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center shadow-md animate-pulse overflow-hidden">
      {/* Thumbnail a la izquierda */}
      <div className="w-full sm:w-36 md:w-44 h-44 sm:h-36 md:h-40 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />

      {/* Cuerpo central */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
        <div>
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mb-2" />
          <div className="h-6 w-3/4 bg-slate-300 dark:bg-slate-700 rounded-lg mb-2" />
          <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
          <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* Representante */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>

      {/* Botones a la derecha */}
      <div className="flex sm:flex-col items-center justify-center gap-2.5 sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
        <div className="w-full sm:w-32 h-9 bg-amber-400/20 dark:bg-amber-500/20 rounded-xl" />
        <div className="w-full sm:w-32 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}
