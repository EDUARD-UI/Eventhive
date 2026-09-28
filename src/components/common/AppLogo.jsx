import logoImage from '../../assets/logo pequeño.png';

export default function AppLogo({
  className = '',
  textClassName = '',
  hiveClassName = 'text-[#0B192C]',
  showName = true,
  alt = 'EventHive',
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logoImage} alt={showName ? '' : alt} className="h-full w-auto shrink-0 object-contain" />
      {showName && (
        <span className={`text-xl font-bold leading-none whitespace-nowrap tracking-tight ${textClassName}`}>
          <span className="text-[#007BFF]">Event</span>
          <span className={hiveClassName}>Hive</span>
        </span>
      )}
    </span>
  );
}
