import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * CartagenaHiveSkyline
 * Silueta arquitectónica estilizada de la icónica Torre del Reloj y Murallas de Cartagena
 * fusionadas orgánicamente con la geometría de colmena (Hive Architecture).
 *
 * En Modo Claro:
 * - Tonos arena/gris cálido sutiles (#A1A1AA / #D4D4D8) con opacidad baja (10-15%)
 * - Difuminado suave hacia la base que se funde con la paleta de la página.
 * - Sin bloques grises toscos ni manchas pesadas.
 *
 * En Modo Oscuro:
 * - Silueta definida principalmente por "rim lighting" (línea superior dorada iluminada)
 *   de 1.5px con resplandor filter: drop-shadow(0 0 4px rgba(245,158,11,0.45)).
 * - Relleno oscuro degradado de azul noche profundo a casi negro.
 */
export default function CartagenaHiveSkyline({ className = '' }) {
  const { isDark } = useTheme();

  return (
    <div
      aria-hidden="true"
      className={`absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none overflow-hidden transition-all duration-500 ${className}`}
    >
      <svg
        viewBox="0 0 1440 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[220px] object-cover object-bottom"
        preserveAspectRatio="none"
      >
        <defs>
          {/* ==================== GRADIENTES MODO OSCURO ==================== */}
          <linearGradient id="skylineDark" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.75" />
            <stop offset="55%" stopColor="#090D1A" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#05070F" stopOpacity="0.98" />
          </linearGradient>

          <linearGradient id="wallDark" x1="0" y1="50" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#05070F" stopOpacity="0.95" />
          </linearGradient>

          {/* Rim light dorado (Línea de luz superior) */}
          <linearGradient id="rimLightGold" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="25%" stopColor="#FBBF24" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="75%" stopColor="#FBBF24" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.35" />
          </linearGradient>

          {/* Filtro de resplandor para el borde dorado */}
          <filter id="goldenRimGlow" x="-10%" y="-30%" width="120%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#F59E0B" floodOpacity="0.5" />
          </filter>

          {/* ==================== GRADIENTES MODO CLARO ==================== */}
          <linearGradient id="skylineLight" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#D4D4D8" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.02" />
          </linearGradient>

          <linearGradient id="wallLight" x1="0" y1="50" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#CBD5E1" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.02" />
          </linearGradient>

          {/* Borde sutil en modo claro */}
          <linearGradient id="rimLightLight" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D4D4D8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#B45309" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#D4D4D8" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow ámbar para el reloj */}
          <radialGradient id="clockGlowGrad" cx="720" cy="118" r="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity={isDark ? '0.95' : '0.55'} />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity={isDark ? '0.6' : '0.2'} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          {/* Textura hexagonal sobre la muralla */}
          <pattern id="wallHexPattern" width="24" height="41.57" patternUnits="userSpaceOnUse">
            <path
              d="M12 0 L24 6.93 L24 20.78 L12 27.71 L0 20.78 L0 6.93 Z M0 20.78 L12 27.71 L12 41.57 L0 34.64 Z M24 20.78 L24 34.64 L12 41.57 Z"
              stroke={isDark ? '#F59E0B' : '#D97706'}
              strokeWidth="0.6"
              strokeOpacity={isDark ? '0.12' : '0.06'}
              fill="none"
            />
          </pattern>

          {/* Difuminado suave hacia el fondo inferior */}
          <linearGradient id="baseFadeDark" x1="0" y1="210" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#05070F" stopOpacity="0" />
            <stop offset="100%" stopColor="#05070F" stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="baseFadeLight" x1="0" y1="210" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0" />
            <stop offset="100%" stopColor="#F1F5F9" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* ========================================================
            1. CONSTELACIÓN HEXAGONAL DETRÁS DE LA TORRE
            ======================================================== */}
        <g
          stroke={isDark ? '#F59E0B' : '#D97706'}
          strokeWidth="1"
          strokeOpacity={isDark ? '0.25' : '0.14'}
          fill="none"
        >
          <polygon points="720,25 745,40 745,70 720,85 695,70 695,40" strokeOpacity={isDark ? '0.35' : '0.18'} />
          <polygon points="775,55 800,70 800,100 775,115 750,100 750,70" strokeOpacity={isDark ? '0.22' : '0.12'} />
          <polygon points="665,55 690,70 690,100 665,115 640,100 640,70" strokeOpacity={isDark ? '0.22' : '0.12'} />
          <polygon points="610,85 635,100 635,130 610,145 585,130 585,100" strokeOpacity={isDark ? '0.15' : '0.08'} />
          <polygon points="830,85 855,100 855,130 830,145 805,130 805,100" strokeOpacity={isDark ? '0.15' : '0.08'} />
        </g>

        {/* ========================================================
            2. MURALLAS HISTÓRICAS LATERALES (BALUARTES)
            ======================================================== */}
        {/* Muralla Izquierda */}
        <path
          d="M 0 170 
             L 100 170 L 100 160 L 125 160 L 125 170 
             L 155 170 L 155 160 L 180 160 L 180 170 
             L 210 170 L 210 160 L 235 160 L 235 170 
             L 270 170 L 270 155 L 300 155 L 300 170 
             L 340 170 L 340 155 L 370 155 L 370 170 
             L 420 170 L 420 150 L 460 150 L 460 170 
             L 520 170 L 520 145 L 570 145 L 570 170 
             L 630 170 L 630 260 L 0 260 Z"
          fill={isDark ? 'url(#wallDark)' : 'url(#wallLight)'}
        />

        {/* Muralla Derecha */}
        <path
          d="M 810 170 
             L 870 170 L 870 145 L 920 145 L 920 170 
             L 970 170 L 970 150 L 1010 150 L 1010 170 
             L 1060 170 L 1060 155 L 1090 155 L 1090 170 
             L 1130 170 L 1130 155 L 1160 155 L 1160 170 
             L 1195 170 L 1195 160 L 1220 160 L 1220 170 
             L 1250 170 L 1250 160 L 1275 160 L 1275 170 
             L 1305 170 L 1305 160 L 1330 160 L 1330 170 
             L 1440 170 L 1440 260 L 810 260 Z"
          fill={isDark ? 'url(#wallDark)' : 'url(#wallLight)'}
        />

        {/* Textura hexagonal sobre la muralla */}
        <rect x="0" y="160" width="630" height="100" fill="url(#wallHexPattern)" opacity={isDark ? 0.45 : 0.25} />
        <rect x="810" y="160" width="630" height="100" fill="url(#wallHexPattern)" opacity={isDark ? 0.45 : 0.25} />

        {/* ========================================================
            3. SILUETA DE LA TORRE DEL RELOJ (CUERPO PRINCIPAL)
            ======================================================== */}
        <g fill={isDark ? 'url(#skylineDark)' : 'url(#skylineLight)'}>
          <path
            d="M 625 260 
               L 625 165 
               L 645 165 L 645 140 
               L 665 140 L 665 95 
               L 680 95 L 680 65 
               L 705 65 L 705 45 
               L 720 10 
               L 735 45 L 735 65 
               L 760 65 L 760 95 
               L 775 95 L 775 140 
               L 795 140 L 795 165 
               L 815 165 L 815 260 Z"
          />

          {/* Arcos históricos de acceso (Portal de los Dulces / Boca del Puente) */}
          <path
            d="M 700 260 L 700 205 C 700 185, 740 185, 740 205 L 740 260 Z"
            fill={isDark ? '#030712' : '#94A3B8'}
            fillOpacity={isDark ? 0.95 : 0.18}
          />
          <path
            d="M 645 260 L 645 218 C 645 204, 675 204, 675 218 L 675 260 Z"
            fill={isDark ? '#030712' : '#94A3B8'}
            fillOpacity={isDark ? 0.95 : 0.18}
          />
          <path
            d="M 765 260 L 765 218 C 765 204, 795 204, 795 218 L 795 260 Z"
            fill={isDark ? '#030712' : '#94A3B8'}
            fillOpacity={isDark ? 0.95 : 0.18}
          />

          {/* Ventanales de la torre */}
          <rect x="712" y="72" width="16" height="18" rx="8" fill={isDark ? '#030712' : '#94A3B8'} fillOpacity={isDark ? 0.95 : 0.18} />
          <rect x="680" y="105" width="12" height="16" rx="6" fill={isDark ? '#030712' : '#94A3B8'} fillOpacity={isDark ? 0.95 : 0.18} />
          <rect x="748" y="105" width="12" height="16" rx="6" fill={isDark ? '#030712' : '#94A3B8'} fillOpacity={isDark ? 0.95 : 0.18} />
        </g>

        {/* ========================================================
            4. RIM LIGHTING: LÍNEAS DE LUZ EN MODO OSCURO
               (En Modo Claro: Borde sutil sin competir)
            ======================================================== */}
        {/* Contorno superior Muralla Izquierda */}
        <path
          d="M 0 170 
             L 100 170 L 100 160 L 125 160 L 125 170 
             L 155 170 L 155 160 L 180 160 L 180 170 
             L 210 170 L 210 160 L 235 160 L 235 170 
             L 270 170 L 270 155 L 300 155 L 300 170 
             L 340 170 L 340 155 L 370 155 L 370 170 
             L 420 170 L 420 150 L 460 150 L 460 170 
             L 520 170 L 520 145 L 570 145 L 570 170 
             L 630 170"
          fill="none"
          stroke={isDark ? 'url(#rimLightGold)' : 'url(#rimLightLight)'}
          strokeWidth={isDark ? 1.5 : 1}
          filter={isDark ? 'url(#goldenRimGlow)' : undefined}
        />

        {/* Contorno superior Muralla Derecha */}
        <path
          d="M 810 170 
             L 870 170 L 870 145 L 920 145 L 920 170 
             L 970 170 L 970 150 L 1010 150 L 1010 170 
             L 1060 170 L 1060 155 L 1090 155 L 1090 170 
             L 1130 170 L 1130 155 L 1160 155 L 1160 170 
             L 1195 170 L 1195 160 L 1220 160 L 1220 170 
             L 1250 170 L 1250 160 L 1275 160 L 1275 170 
             L 1305 170 L 1305 160 L 1330 160 L 1330 170 
             L 1440 170"
          fill="none"
          stroke={isDark ? 'url(#rimLightGold)' : 'url(#rimLightLight)'}
          strokeWidth={isDark ? 1.5 : 1}
          filter={isDark ? 'url(#goldenRimGlow)' : undefined}
        />

        {/* Perímetro superior iluminado de la Torre del Reloj */}
        <path
          d="M 625 165 
             L 645 165 L 645 140 
             L 665 140 L 665 95 
             L 680 95 L 680 65 
             L 705 65 L 705 45 
             L 720 10 
             L 735 45 L 735 65 
             L 760 65 L 760 95 
             L 775 95 L 775 140 
             L 795 140 L 795 165 
             L 815 165"
          fill="none"
          stroke={isDark ? 'url(#rimLightGold)' : 'url(#rimLightLight)'}
          strokeWidth={isDark ? 1.6 : 1}
          filter={isDark ? 'url(#goldenRimGlow)' : undefined}
        />

        {/* ========================================================
            5. RELOJ DE LA TORRE Y AGUJA SUPERIOR
            ======================================================== */}
        {/* Resplandor y Esfera del Reloj */}
        <circle cx="720" cy="118" r="15" fill="url(#clockGlowGrad)" />
        <circle
          cx="720"
          cy="118"
          r="11"
          fill={isDark ? '#0B132B' : '#FFFFFF'}
          stroke={isDark ? '#F59E0B' : '#D97706'}
          strokeWidth={isDark ? 1.6 : 1.2}
        />

        {/* Manecillas del reloj */}
        <line
          x1="720"
          y1="118"
          x2="720"
          y2="110"
          stroke={isDark ? '#FDE68A' : '#B45309'}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <line
          x1="720"
          y1="118"
          x2="726"
          y2="122"
          stroke={isDark ? '#FDE68A' : '#B45309'}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="720" cy="118" r="1.5" fill={isDark ? '#F59E0B' : '#D97706'} />

        {/* Cruz/Aguja dorada en la cúpula superior */}
        <line
          x1="720"
          y1="4"
          x2="720"
          y2="12"
          stroke={isDark ? '#FBBF24' : '#D97706'}
          strokeWidth="1.5"
          filter={isDark ? 'url(#goldenRimGlow)' : undefined}
        />
        <line
          x1="717"
          y1="7"
          x2="723"
          y2="7"
          stroke={isDark ? '#FBBF24' : '#D97706'}
          strokeWidth="1.5"
          filter={isDark ? 'url(#goldenRimGlow)' : undefined}
        />

        {/* ========================================================
            6. DIFUMINADO Y FUSIÓN NATURAL CON LA SIGUIENTE SECCIÓN
            ======================================================== */}
        <rect
          x="0"
          y="210"
          width="1440"
          height="50"
          fill={isDark ? 'url(#baseFadeDark)' : 'url(#baseFadeLight)'}
        />
      </svg>
    </div>
  );
}
