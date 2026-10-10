import React from 'react';

/**
 * TicketSectionSeparator
 * Separador ornamental de secciones basado fielmente en el diseño de tiquete / boleto:
 * - Muescas circulares laterales cóncavas con sombreado interno sutil.
 * - Perforación central con línea punteada dashed.
 * - Ancho adaptable y espaciado proporcional entre bloques de contenido.
 */
export default function TicketSectionSeparator({
  className = '',
  maxWidth = '',
  notchColor = 'bg-slate-100 dark:bg-[#070D1B]',
  borderColor = 'border-slate-300 dark:border-slate-800',
  'aria-hidden': ariaHidden,
}) {
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-hidden={ariaHidden}
      className={`w-full py-2 sm:py-3 flex justify-center items-center select-none overflow-hidden ${className}`}
    >
      <div className={`w-full ${maxWidth}`}>
        <div className="relative flex h-4 sm:h-5 items-center w-full">
          {/* Línea de perforación con muescas laterales estilo boleto */}
          <div
            aria-hidden="true"
            className={`w-full border-b-2 border-dashed ${borderColor} mx-2 sm:mx-3`}
          />
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${notchColor} shadow-[inset_-2px_0_3px_rgba(15,23,42,0.12)]`}
          />
          <span
            aria-hidden="true"
            className={`absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${notchColor} shadow-[inset_2px_0_3px_rgba(15,23,42,0.12)]`}
          />
        </div>
      </div>
    </div>
  );
}
