export default function PlaceCard({ place }) {
  const { name, activeEvents, gradient } = place;

  return (
    <div
      className={`relative rounded-card overflow-hidden aspect-[3/3.6] flex items-end p-4 text-white bg-gradient-to-br ${gradient} border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 40%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />
      <div className="relative z-[1]">
        <h4 className="text-[15.5px] font-bold text-white drop-shadow-sm">{name}</h4>
        <span className="text-xs text-slate-200 drop-shadow-xs">{activeEvents} eventos activos</span>
      </div>
    </div>
  );
}
