export default function EventCardSkeleton({ notchBg = 'bg-[#F8FAFC]', aspectVariant = 'standard' }) {
  const aspectClass =
    aspectVariant === 'tall'
      ? 'aspect-[4/3]'
      : aspectVariant === 'wide'
      ? 'aspect-[16/9]'
      : 'aspect-[16/10]';

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between overflow-hidden animate-pulse">
      {/* Portada Skeleton */}
      <div className="p-3.5 pb-2">
        <div className={`w-full ${aspectClass} rounded-2xl bg-slate-200`} />
        <div className="h-5 bg-slate-200 rounded-lg w-3/4 mt-3" />
      </div>

      {/* Línea Separadora 1 */}
      <div className="w-full px-4 my-1">
        <div className="w-full border-b-2 border-dashed border-slate-200" />
      </div>

      {/* Metadatos Skeleton */}
      <div className="px-5 py-3 space-y-2.5">
        <div className="h-4 bg-slate-100 rounded w-32" />
        <div className="h-8 bg-slate-100 rounded-xl w-full" />
      </div>

      {/* Línea Separadora 2 */}
      <div className="w-full px-4 my-1">
        <div className="w-full border-b-2 border-dashed border-slate-200" />
      </div>

      {/* Botón Skeleton */}
      <div className="px-5 pt-3 pb-5 flex flex-col items-center">
        <div className="h-10 w-full bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}
