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
  fallbackText = 'Sin imagen',
  showText = true,
  iconSize = 22,
  children,
}) {
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (${fallbackText})`}
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#243447] to-[#16202e] text-slate-300 border border-slate-700/50 select-none overflow-hidden ${fallbackClassName || className}`}
      >
        <div className="flex flex-col items-center justify-center gap-1.5 p-3 text-center pointer-events-none">
          <FiImage
            size={iconSize}
            className="text-slate-400/80 drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
          />
          {showText && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300/80">
              {fallbackText}
            </span>
          )}
        </div>
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
