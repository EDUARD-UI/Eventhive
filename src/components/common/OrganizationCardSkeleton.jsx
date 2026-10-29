import React from 'react';

/**
 * OrganizationCardSkeleton
 * Skeleton de carga que replica fielmente la proporción del nuevo OrganizationListCard.
 */
export default function OrganizationCardSkeleton() {
  return (
    <div className="relative bg-white dark:bg-[#0E1626] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between overflow-hidden shadow-xs animate-pulse">
      {/* 1. Cover Banner Skeleton */}
      <div className="h-24 sm:h-28 w-full bg-slate-200/80 dark:bg-slate-800/80 relative p-3 flex justify-between">
        <div className="h-5 w-24 bg-slate-300 dark:bg-slate-700/80 rounded-full" />
        <div className="h-5 w-20 bg-slate-300 dark:bg-slate-700/80 rounded-full" />
      </div>

      {/* 2. Cuerpo Skeleton con Logo Overlapping */}
      <div className="px-5 sm:px-6 pb-5 pt-0 -mt-9 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-end justify-between mb-3">
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-300 dark:bg-slate-700 border-3 border-white dark:border-[#0E1626] shadow-sm" />
            <div className="w-20 h-7 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="h-5 w-3/5 bg-slate-300 dark:bg-slate-700 rounded-lg mb-2" />
          <div className="h-3 w-2/5 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
          <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
          <div className="h-3 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>

        {/* 3. Footer Skeleton */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-3.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="h-3.5 w-16 bg-slate-300 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    </div>
  );
}
