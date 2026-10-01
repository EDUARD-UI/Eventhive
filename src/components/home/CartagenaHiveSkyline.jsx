/**
 * CartagenaHiveSkyline
 * Silueta arquitectónica vectorial estilizada de la icónica Torre del Reloj y Murallas de Cartagena
 * fusionadas orgánicamente con la geometría de panal de abeja (Hexagonal Hive Architecture).
 */
export default function CartagenaHiveSkyline({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute bottom-0 left-0 right-0 w-full pointer-events-none select-none overflow-hidden ${className}`}
    >
      <svg
        viewBox="0 0 1440 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[220px] object-cover object-bottom"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Gradiente de la silueta */}
          <linearGradient id="skylineGrad" x1="0" y1="0" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0B1B3D" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#0D1527" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0D1527" stopOpacity="1" />
          </linearGradient>

          {/* Gradiente de las murallas laterales */}
          <linearGradient id="wallGrad" x1="0" y1="50" x2="0" y2="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F244F" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#0D1527" stopOpacity="0.98" />
          </linearGradient>

          {/* Glow ámbar para el reloj y detalles */}
          <radialGradient id="clockGlow" cx="720" cy="118" r="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          {/* Patrón sutil de panal dentro de las murallas */}
          <pattern id="wallHexPattern" width="24" height="41.57" patternUnits="userSpaceOnUse">
            <path
              d="M12 0 L24 6.93 L24 20.78 L12 27.71 L0 20.78 L0 6.93 Z M0 20.78 L12 27.71 L12 41.57 L0 34.64 Z M24 20.78 L24 34.64 L12 41.57 Z"
              stroke="#F59E0B"
              strokeWidth="0.6"
              strokeOpacity="0.12"
              fill="none"
            />
          </pattern>
        </defs>

        {/* ========================================================
            1. CELDA HEXAGONAL EN EL CIELO DETRÁS DE LA TORRE
            ======================================================== */}
        <g stroke="#F59E0B" strokeWidth="1" strokeOpacity="0.22" fill="none">
          {/* Celdas que flotan como constelación hexagonal */}
          <polygon points="720,25 745,40 745,70 720,85 695,70 695,40" strokeOpacity="0.3" />
          <polygon points="775,55 800,70 800,100 775,115 750,100 750,70" strokeOpacity="0.18" />
          <polygon points="665,55 690,70 690,100 665,115 640,100 640,70" strokeOpacity="0.18" />
          <polygon points="610,85 635,100 635,130 610,145 585,130 585,100" strokeOpacity="0.1" />
          <polygon points="830,85 855,100 855,130 830,145 805,130 805,100" strokeOpacity="0.1" />
        </g>

        {/* ========================================================
            2. MURALLAS HISTÓRICAS LATERALES (BALUARTES)
            ======================================================== */}
        {/* Muralla Izquierda con almenas coloniales */}
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
          fill="url(#wallGrad)"
        />

        {/* Muralla Derecha con almenas */}
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
          fill="url(#wallGrad)"
        />

        {/* Textura hexagonal sobre la muralla */}
        <rect x="0" y="160" width="630" height="100" fill="url(#wallHexPattern)" opacity="0.4" />
        <rect x="810" y="160" width="630" height="100" fill="url(#wallHexPattern)" opacity="0.4" />

        {/* ========================================================
            3. SILUETA DE LA TORRE DEL RELOJ (BOCA DEL PUENTE)
            ======================================================== */}
        <g fill="url(#skylineGrad)">
          {/* Base del cuerpo central */}
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

          {/* Arcos góticos y de acceso (Portal de los Dulces / Boca del Puente) */}
          {/* Arco Principal Central */}
          <path
            d="M 700 260 L 700 205 C 700 185, 740 185, 740 205 L 740 260 Z"
            fill="#080F1D"
          />
          {/* Arco Izquierdo */}
          <path
            d="M 645 260 L 645 218 C 645 204, 675 204, 675 218 L 675 260 Z"
            fill="#080F1D"
          />
          {/* Arco Derecho */}
          <path
            d="M 765 260 L 765 218 C 765 204, 795 204, 795 218 L 795 260 Z"
            fill="#080F1D"
          />

          {/* Ventanales de la torre */}
          <rect x="712" y="72" width="16" height="18" rx="8" fill="#080F1D" />
          <rect x="680" y="105" width="12" height="16" rx="6" fill="#080F1D" />
          <rect x="748" y="105" width="12" height="16" rx="6" fill="#080F1D" />
        </g>

        {/* Resplandor y Esfera del Reloj de la Torre */}
        <circle cx="720" cy="118" r="14" fill="url(#clockGlow)" />
        <circle cx="720" cy="118" r="11" fill="#0B132B" stroke="#F59E0B" strokeWidth="1.6" />
        {/* Manecillas del reloj (marcando las 8:00 de la noche, hora de eventos) */}
        <line x1="720" y1="118" x2="720" y2="110" stroke="#FDE68A" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="720" y1="118" x2="726" y2="122" stroke="#FDE68A" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="720" cy="118" r="1.5" fill="#F59E0B" />

        {/* Cruz/Aguja dorada en la cúpula superior */}
        <line x1="720" y1="4" x2="720" y2="12" stroke="#F59E0B" strokeWidth="1.5" />
        <line x1="717" y1="7" x2="723" y2="7" stroke="#F59E0B" strokeWidth="1.5" />

        {/* Fusión con niebla de fondo hacia la base */}
        <rect x="0" y="220" width="1440" height="40" fill="url(#skylineGrad)" opacity="0.9" />
      </svg>
    </div>
  );
}
