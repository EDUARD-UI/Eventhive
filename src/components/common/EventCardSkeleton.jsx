export default function EventCardSkeleton({ notchBg = 'bg-[#F8FAFC]' }) {
  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse">
      {/* Portada Skeleton */}
      <div className="p-3.5 pb-2">
        <div className="w-full aspect-[16/10] rounded-2xl bg-slate-200" />
        <div className="h-5 bg-slate-200 rounded-lg w-3/4 mt-3" />
      </div>

      {/* Perforación 1 */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 z-10`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 z-10`} />
      </div>

      {/* Metadatos Skeleton */}
      <div className="px-5 py-3 space-y-2.5">
        <div className="h-4 bg-slate-100 rounded w-32" />
        <div className="h-8 bg-slate-100 rounded-xl w-full" />
      </div>

      {/* Perforación 2 */}
      <div className="relative flex items-center w-full my-1">
        <div className={`absolute -left-3 w-6 h-6 rounded-full ${notchBg} border-r border-slate-200 z-10`} />
        <div className="w-full border-b-2 border-dashed border-slate-200 mx-3" />
        <div className={`absolute -right-3 w-6 h-6 rounded-full ${notchBg} border-l border-slate-200 z-10`} />
      </div>

      {/* Botón Skeleton */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center">
        <div className="h-10 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
