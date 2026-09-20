import React from 'react';

/**
 * EventHiveLogo — Componente Vectorial SVG Oficial de EventHive
 * Recrea fielmente el emblema de panal hexagonal (hive), los hexágonos azul zafiro y oro caribeño,
 * el boleto central inclinado con la Torre del Reloj de Cartagena, la estrella y los símbolos culturales.
 *
 * @param {string} variant - 'full' (emblema con texto EVENTHIVE abajo), 'horizontal' (emblema + texto al lado), 'icon' (solo el emblema).
 * @param {number|string} size - Altura/escala en píxeles.
 * @param {string} className - Clases CSS para el contenedor.
 */
export default function EventHiveLogo({
  variant = 'horizontal',
  size = 40,
  className = '',
  textClassName = '',
  eventClassName = '',
}) {
  // Coordenadas calculadas para hexágonos regulares con esquinas redondeadas
  const hexPath = 'M0,-58 L50.2,-29 L50.2,29 L0,58 L-50.2,29 L-50.2,-29 Z';

  const renderIconSvg = () => (
    <svg
      viewBox="0 0 500 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible"
    >
      <defs>
        {/* Gradiente Azul Zafiro Superior */}
        <linearGradient id="eh-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2590eb" />
          <stop offset="50%" stopColor="#0a60bd" />
          <stop offset="100%" stopColor="#043a7a" />
        </linearGradient>

        {/* Gradiente Azul Central */}
        <linearGradient id="eh-blue-center" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e7fd9" />
          <stop offset="100%" stopColor="#08478f" />
        </linearGradient>

        {/* Gradiente Dorado / Ámbar Caribeño */}
        <linearGradient id="eh-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd257" />
          <stop offset="45%" stopColor="#f5a418" />
          <stop offset="100%" stopColor="#c77700" />
        </linearGradient>

        {/* Gradiente del Boleto Central (Azul a Dorado) */}
        <linearGradient id="eh-ticket-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0e5eb5" />
          <stop offset="55%" stopColor="#1a74d2" />
          <stop offset="85%" stopColor="#e39912" />
          <stop offset="100%" stopColor="#f5b324" />
        </linearGradient>

        {/* Gradiente del Texto Oficial */}
        <linearGradient id="eh-text-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0b4380" />
          <stop offset="60%" stopColor="#0e5fb8" />
          <stop offset="100%" stopColor="#157be0" />
        </linearGradient>

        {/* Filtro de sombra sutil */}
        <filter id="eh-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#041a38" floodOpacity="0.25" />
        </filter>

        <filter id="eh-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#ffd257" floodOpacity="0.4" />
        </filter>

        {/* Patrón de panal para el interior del boleto */}
        <pattern id="eh-honeycomb-pattern" width="16" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M8,0 L16,5 L16,15 L8,20 L0,15 L0,5 Z M8,28 L16,23 L16,13 L8,8 L0,13 L0,23 Z"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>

      {/* --- GRUPO DE HEXÁGONOS (HIVE) --- */}
      <g filter="url(#eh-shadow)">
        {/* 1. Hexágono Superior Central (Azul) */}
        <g transform="translate(250, 75)">
          <path d={hexPath} fill="url(#eh-blue-grad)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-40,-24 L0,-48 L40,-24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
        </g>

        {/* 2. Hexágono Superior Izquierdo (Azul) */}
        <g transform="translate(138, 142)">
          <path d={hexPath} fill="url(#eh-blue-grad)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-40,-24 L0,-48 L40,-24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
        </g>

        {/* 3. Hexágono Superior Derecho (Azul) */}
        <g transform="translate(362, 142)">
          <path d={hexPath} fill="url(#eh-blue-grad)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-40,-24 L0,-48 L40,-24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
        </g>

        {/* 4. Hexágono Central (Base azul de fondo para el ticket) */}
        <g transform="translate(250, 210)">
          <path d={hexPath} fill="url(#eh-blue-center)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
        </g>

        {/* 5. Hexágono Inferior Izquierdo (Dorado Ámbar) */}
        <g transform="translate(138, 278)">
          <path d={hexPath} fill="url(#eh-gold-grad)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-40,-24 L0,-48 L40,-24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
        </g>

        {/* 6. Hexágono Inferior Derecho (Dorado Ámbar) */}
        <g transform="translate(362, 278)">
          <path d={hexPath} fill="url(#eh-gold-grad)" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
          <path d="M-40,-24 L0,-48 L40,-24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" />
        </g>
      </g>

      {/* --- BOLETO CENTRAL INCLINADO (TICKET) --- */}
      <g transform="translate(250, 210) rotate(-22)">
        {/* Sombra del Boleto */}
        <rect
          x="-95"
          y="-60"
          width="190"
          height="120"
          rx="18"
          fill="#02142e"
          opacity="0.35"
          transform="translate(4, 6)"
        />

        {/* Silueta Base del Boleto con muescas circulares laterales */}
        <g>
          <path
            d="
              M -78,-58
              L 78,-58
              A 16,16 0 0 1 94,-42
              L 94,-12
              A 14,14 0 0 0 94,12
              L 94,42
              A 16,16 0 0 1 78,58
              L -78,58
              A 16,16 0 0 1 -94,42
              L -94,12
              A 14,14 0 0 0 -94,-12
              L -94,-42
              A 16,16 0 0 1 -78,-58
              Z
            "
            fill="url(#eh-ticket-grad)"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Patrón de Panal dentro del boleto */}
          <path
            d="
              M -78,-58
              L 78,-58
              A 16,16 0 0 1 94,-42
              L 94,-12
              A 14,14 0 0 0 94,12
              L 94,42
              A 16,16 0 0 1 78,58
              L -78,58
              A 16,16 0 0 1 -94,42
              L -94,12
              A 14,14 0 0 0 -94,-12
              L -94,-42
              A 16,16 0 0 1 -78,-58
              Z
            "
            fill="url(#eh-honeycomb-pattern)"
            opacity="0.3"
          />

          {/* Borde interior dorado con brillo */}
          <path
            d="
              M -72,-52
              L 72,-52
              L 88,-38
              L 88,-16
              A 18,18 0 0 0 88,16
              L 88,38
              L 72,52
              L -72,52
              L -88,38
              L -88,16
              A 18,18 0 0 0 -88,-16
              L -88,-38
              Z
            "
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.2"
            strokeDasharray="4 2.5"
          />
        </g>

        {/* --- ICONOGRAFÍA CULTURAL DENTRO DEL BOLETO --- */}
        {/* 1. Silueta de la Torre del Reloj de Cartagena (Derecha) */}
        <g transform="translate(50, -32) scale(0.65)" fill="#ffffff" opacity="0.95">
          {/* Cúpula y veleta */}
          <path d="M12,0 L16,0 L14,-10 Z" />
          <circle cx="14" cy="-12" r="2.5" />
          {/* Cúpula con aguja */}
          <path d="M5,10 C5,0 23,0 23,10 Z" />
          {/* Cuerpo campanario con reloj */}
          <rect x="4" y="10" width="20" height="24" rx="2" />
          <circle cx="14" cy="22" r="5" fill="#1564be" />
          <circle cx="14" cy="22" r="1.5" fill="#ffffff" />
          {/* Cornisas intermedias y almenas */}
          <rect x="0" y="34" width="28" height="6" rx="1" />
          <path d="M1,34 L1,31 L4,31 L4,34 M10,34 L10,31 L13,31 L13,34 M19,34 L19,31 L22,31 L22,34 M27,34 L27,31 L28,31 L28,34" stroke="#ffffff" strokeWidth="2" />
          {/* Base con arcada colonial */}
          <rect x="1" y="40" width="26" height="34" />
          <path d="M7,74 L7,55 C7,49 21,49 21,55 L21,74 Z" fill="#e39912" />
        </g>

        {/* 2. Gran Estrella Brillante Central */}
        <g transform="translate(-2, 2) scale(1.15)" filter="url(#eh-glow)">
          <polygon
            points="0,-22 6.5,-6.5 22,-4.5 10.5,6.5 14,22 0,13.5 -14,22 -10.5,6.5 -22,-4.5 -6.5,-6.5"
            fill="#ffffff"
            stroke="#fff1b8"
            strokeWidth="1.5"
          />
        </g>

        {/* 3. Notas Musicales (Arriba izquierda) */}
        <g transform="translate(-64, -30) scale(0.85)" fill="#ffffff" opacity="0.95">
          <circle cx="4" cy="14" r="3.5" />
          <circle cx="15" cy="11" r="3.5" />
          <path d="M7,14 L7,3 L18,0 L18,11" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7,5 L18,2" stroke="#ffffff" strokeWidth="2.2" />
        </g>

        {/* 4. Pareja de Baile / Danzantes (Centro-izquierda arriba) */}
        <g transform="translate(-36, -34) scale(0.75)" fill="#ffffff" opacity="0.95">
          <circle cx="6" cy="4" r="2.5" />
          <circle cx="16" cy="3" r="2.5" />
          {/* Hombre bailando */}
          <path d="M6,7 L6,18 L1,26 M6,13 L11,17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Mujer con vestido cumbia/salsa */}
          <path d="M16,6 L16,14 L22,25 L10,25 Z" fill="#ffffff" />
        </g>

        {/* 5. Micrófono (Izquierda centro) */}
        <g transform="translate(-62, -4) scale(0.8)" fill="#ffffff" opacity="0.95">
          <rect x="5" y="2" width="7" height="12" rx="3.5" />
          <path d="M2,8 C2,14 15,14 15,8" stroke="#ffffff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M8.5,14 L8.5,20 M5,20 L12,20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* 6. Copa de Cóctel (Centro abajo) */}
        <g transform="translate(-40, 2) scale(0.85)" fill="#ffffff" opacity="0.95">
          <path d="M3,5 L17,5 L10,13 Z" fill="#ffffff" />
          <path d="M10,13 L10,21 M6,21 L14,21" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="3" r="2" fill="#ffd257" />
        </g>

        {/* 7. Cámara Fotográfica (Abajo izquierda) */}
        <g transform="translate(-56, 18) scale(0.7)" fill="#ffffff" opacity="0.95">
          <path d="M6,4 L9,1 L17,1 L20,4 Z" />
          <rect x="2" y="4" width="22" height="16" rx="3.5" />
          <circle cx="13" cy="12" r="5" fill="#e39912" />
          <circle cx="13" cy="12" r="2.5" fill="#ffffff" />
        </g>
      </g>

      {/* --- TEXTO EVENTHIVE OFICIAL AL PIE --- */}
      {variant === 'full' && (
        <text
          x="250"
          y="420"
          textAnchor="middle"
          fill="url(#eh-text-grad)"
          fontFamily="'Space Grotesk', system-ui, -apple-system, sans-serif"
          fontWeight="800"
          fontSize="48"
          letterSpacing="4"
        >
          EVENTHIVE
        </text>
      )}
    </svg>
  );

  // Variante icono único
  if (variant === 'icon') {
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-label="EventHive"
      >
        {renderIconSvg()}
      </div>
    );
  }

  // Variante full con texto integrado en el SVG
  if (variant === 'full') {
    return (
      <div
        className={`inline-flex flex-col items-center justify-center ${className}`}
        style={{ width: typeof size === 'number' ? size * 1.05 : size }}
        aria-label="EventHive"
      >
        {renderIconSvg()}
      </div>
    );
  }

  // Variante horizontal estándar: Emblema vectorial + Tipografía de marca (Ideal para Navbars, Headers y Footers)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="shrink-0 transition-transform duration-200 hover:scale-105"
      >
        {renderIconSvg()}
      </div>

      <div className="flex flex-col justify-center leading-none select-none">
        <div className={`flex items-center gap-1 font-display font-extrabold text-ink tracking-tight ${textClassName || 'text-xl sm:text-2xl'}`}>
          <span className={eventClassName}>Event</span>
          <span className="text-[#007BFF]">Hive</span>
          
        </div>
        <span className="text-[9.5px] font-semibold tracking-widest uppercase text-muted mt-0.5">
          Cartagena de Indias
        </span>
      </div>
    </div>
  );
}
