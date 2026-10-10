import logoImage from '../../assets/logo pequeño.png';

export default function AppLogo({
  className = '',
  textClassName = '',
  hiveClassName = 'text-amber-500',
  showName = true,
  showImage = true,
  alt = 'EventHive',
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {showImage && (
        <img src={logoImage} alt={showName ? '' : alt} className="h-full w-auto shrink-0 object-contain" />
      )}
      {showName && (
        <span className={`font-display text-xl font-bold leading-none whitespace-nowrap ${textClassName}`}>
          <span>Event</span><span className={hiveClassName}>Hive</span>
        </span>
      )}
    </span>
  );
}
