export default function AppLogo({
  className = '',
  textClassName = '',
  hiveClassName = 'text-amber-500',
  showName = true,
  showImage = true,
  subtitle = null,
  subtitleClassName = '',
  imageSrc = '/LOGO45x50.png',
  imageClassName = '',
  alt = 'EventHive',
}) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {showImage && (
        <img
          src={imageSrc}
          alt={showName ? '' : alt}
          className={`h-full w-auto shrink-0 object-contain ${imageClassName}`}
        />
      )}
      {showName && (
        <span className="flex flex-col justify-center">
          <span className={`font-display text-xl font-bold leading-none whitespace-nowrap ${textClassName}`}>
            <span>Event</span><span className={hiveClassName}>Hive</span>
          </span>
          {subtitle && (
            <span className={`text-xs font-normal mt-1 leading-tight ${subtitleClassName}`}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
