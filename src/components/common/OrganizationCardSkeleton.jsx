export default function OrganizationCardSkeleton({ notchBg = 'bg-[#F8FAFC]' }) {
  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse">
      {/* Cabecera Skeleton */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-200 rounded w-3/4" />
            <div className="h-3.5 bg-slate-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-7 bg-slate-100 rounded-xl w-full" />
      </div>

      {/* Perforación 1 */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 z-10`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 z-10`} />
      </div>

      {/* Métricas Skeleton */}
      <div className="px-5 py-3 space-y-2.5">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded w-14" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Perforación 2 */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 z-10`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 z-10`} />
      </div>

      {/* Barcode + Botones Skeleton */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center gap-3">
        <div className="h-6 w-36 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="h-9 bg-slate-200 rounded-xl" />
          <div className="h-9 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
