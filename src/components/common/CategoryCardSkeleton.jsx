export default function CategoryCardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/[0.07] bg-white dark:bg-[#151D2F] p-7 min-h-[220px] sm:min-h-[240px] flex flex-col justify-between animate-pulse shadow-xs">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="w-20 h-6 rounded-full bg-slate-100 dark:bg-slate-800/60" />
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div className="space-y-2 w-3/4">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-4/5" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded-md w-28" />
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 shrink-0" />
      </div>
    </div>
  );
}
