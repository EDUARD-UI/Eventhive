import { useState, useEffect } from 'react';

/**
 * Componente de imagen con soporte para carga fallida o URL ausente.
 * Muestra una superficie gris neutra sin iconos, logos ni texto (Regla 2.2).
 * Mantiene las dimensiones y el radio de borde correspondientes al contenedor.
 * Soporta carga diferida lazy, decodificación asíncrona y detección de carga onLoad.
 */
export default function ImageWithFallback({
  src,
  alt = 'Imagen',
  className = '',
  imgClassName = '',
  fallbackClassName = '',
  onLoad,
  priority = false,
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
        aria-label={alt}
        className={`w-full h-full bg-slate-200 dark:bg-slate-800 border border-slate-300/30 dark:border-slate-700/40 select-none overflow-hidden transition-colors flex items-center justify-center ${fallbackClassName || className}`}
      >
        {children}
      </div>
    );
  }

  const defaultFit = /object-(cover|contain|fill|none|scale-down)/.test(imgClassName)
    ? ''
    : 'object-cover';

  return (
    <div className={`relative overflow-hidden w-full h-full ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setHasError(true)}
        onLoad={onLoad}
        className={`h-full w-full object-center ${defaultFit} transition-all duration-300 ${imgClassName}`}
      />
      {children}
    </div>
  );
}
