import React from 'react';

/**
 * Cinta diagonal auténtica SOLD OUT en la esquina superior izquierda de la tarjeta o portada.
 * - Color rojo profundo (#DC2626).
 * - Tipografía blanca audaz e imponente.
 * - Inclinación diagonal de -45 grados.
 * - Integrada con la imagen de portada sin obstruir controles ni títulos importantes.
 */
export default function SoldOutRibbon({ className = '', size = 'md' }) {
  const isLarge = size === 'lg';

  return (
    <div
      aria-label="Evento agotado - Sold Out"
      className={`absolute top-0 left-0 ${
        isLarge ? 'w-32 h-32' : 'w-24 h-24'
      } overflow-hidden pointer-events-none z-30 select-none ${className}`}
    >
      <div
        className={`absolute transform -rotate-45 bg-[#DC2626] text-white font-black uppercase tracking-wider text-center shadow-lg border-y border-red-700/80 drop-shadow-md ${
          isLarge
            ? 'text-[11px] py-1.5 -left-10 top-6 w-40'
            : 'text-[9px] sm:text-[10px] py-1 -left-8 top-4 w-32'
        }`}
      >
        SOLD OUT
      </div>
    </div>
  );
}
