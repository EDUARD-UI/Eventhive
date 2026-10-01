import { useState, useEffect } from 'react';
import { FiImage } from 'react-icons/fi';

/**
 * Componente de imagen con soporte para carga fallida o URL nula.
 * Aplica un fondo gris azulado sofisticado (#1e293b / slate-800) con icono
 * y texto discreto para indicar visualmente que no se cargó la imagen.
 */
export default function ImageWithFallback({
  src,
  alt = 'Imagen',
  className = '',
  imgClassName = '',
  fallbackClassName = '',
  fallbackGradient = '',
  fallbackText = 'Sin imagen',
  showText = true,
  iconSize = 22,
  children,
}) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  const defaultGradient = fallbackGradient || 'bg-gradient-to-br from-[#0a1838] via-[#11234f] to-[#007bff]';

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (${fallbackText})`}
        className={`relative flex flex-col items-center justify-center text-white border border-white/10 select-none overflow-hidden ${defaultGradient} ${fallbackClassName || className}`}
      >
        {/* Glow circles for rich aesthetic */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-black/20 rounded-full blur-lg pointer-events-none" />

        {(showText || (iconSize && iconSize > 0)) && (
          <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 p-3 text-center pointer-events-none">
            {iconSize > 0 && (
              <FiImage
                size={iconSize}
                className="text-white/80 drop-shadow transition-transform duration-300 group-hover:scale-110"
              />
            )}
            {showText && fallbackText && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/90 drop-shadow-sm">
                {fallbackText}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setHasError(true)}
        className={`h-full w-full object-cover transition-all duration-300 ${imgClassName}`}
      />
      {children}
    </div>
  );
}
