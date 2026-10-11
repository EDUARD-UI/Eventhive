import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Helper to compute pointy-topped hexagon SVG points
 */
function getHexPoints(cx, cy, r) {
  const angles = [30, 90, 150, 210, 270, 330].map((deg) => (deg * Math.PI) / 180);
  return angles
    .map((a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
    .join(' ');
}

// Constelación para el Hero (vista horizontal 1440x680 con flujo ascendente a la derecha)
const HERO_HEXAGONS = [
  { cx: 560, cy: 590, r: 22, filled: false, pulse: false },
  { cx: 640, cy: 520, r: 36, filled: true, pulse: true },
  { cx: 720, cy: 560, r: 20, filled: false, dashed: true },
  { cx: 760, cy: 470, r: 48, filled: false, concentric: true },
  { cx: 850, cy: 520, r: 26, filled: false },
  { cx: 890, cy: 410, r: 62, filled: true, pulse: false },
  { cx: 970, cy: 460, r: 32, filled: false, dashed: true },
  { cx: 1010, cy: 350, r: 46, filled: false, concentric: true },
  { cx: 1100, cy: 410, r: 28, filled: false },
  { cx: 1130, cy: 280, r: 66, filled: true, pulse: true },
  { cx: 1220, cy: 330, r: 34, filled: false, concentric: true },
  { cx: 1250, cy: 190, r: 52, filled: false, dashed: true },
  { cx: 1330, cy: 230, r: 26, filled: false },
  { cx: 1370, cy: 110, r: 44, filled: true },
  { cx: 1410, cy: 50, r: 32, filled: false },
  { cx: 940, cy: 240, r: 22, filled: false },
  { cx: 1050, cy: 180, r: 36, filled: false, concentric: true },
  { cx: 1170, cy: 120, r: 24, filled: false },
  { cx: 690, cy: 390, r: 18, filled: false },
  { cx: 810, cy: 330, r: 30, filled: false, dashed: true },
];

// Constelación para Auth (vista vertical 520x840 alineada y con las mismas dimensiones)
const AUTH_HEXAGONS = [
  { cx: 80, cy: 740, r: 26, filled: false },
  { cx: 160, cy: 690, r: 36, filled: true, pulse: true },
  { cx: 240, cy: 730, r: 20, filled: false, dashed: true },
  { cx: 330, cy: 670, r: 48, filled: false, concentric: true },
  { cx: 420, cy: 720, r: 26, filled: false },
  { cx: 110, cy: 570, r: 48, filled: false, concentric: true },
  { cx: 210, cy: 540, r: 62, filled: true, pulse: false },
  { cx: 310, cy: 560, r: 36, filled: false, dashed: true },
  { cx: 410, cy: 520, r: 48, filled: true, pulse: true },
  { cx: 70, cy: 420, r: 36, filled: false, dashed: true },
  { cx: 180, cy: 390, r: 26, filled: false },
  { cx: 340, cy: 380, r: 62, filled: false, concentric: true },
  { cx: 450, cy: 410, r: 36, filled: false },
  { cx: 120, cy: 260, r: 48, filled: true, pulse: false },
  { cx: 230, cy: 250, r: 36, filled: false, concentric: true },
  { cx: 330, cy: 230, r: 62, filled: true, pulse: true },
  { cx: 440, cy: 270, r: 26, filled: false, dashed: true },
  { cx: 90, cy: 120, r: 26, filled: false },
  { cx: 200, cy: 110, r: 36, filled: false, dashed: true },
  { cx: 310, cy: 90, r: 48, filled: false, concentric: true },
  { cx: 420, cy: 130, r: 36, filled: true },
  { cx: 470, cy: 60, r: 20, filled: false },
];

/**
 * HexagonalHivePattern
 * Componente único y reutilizable para la geometría arquitectónica de colmena de EventHive.
 * Centraliza la lógica SVG evitando duplicación entre Hero y AuthLayout.
 *
 * @param {'hero' | 'auth'} variant Formato apaisado ('hero') o vertical ('auth')
 */
export default function HexagonalHivePattern({ variant = 'hero', className = '' }) {
  const { isDark } = useTheme();

  const isAuth = variant === 'auth';
  const viewBox = isAuth ? '0 0 520 840' : '0 0 1440 680';
  const hexagons = isAuth ? AUTH_HEXAGONS : HERO_HEXAGONS;
  const gradientId = isAuth ? 'authHiveGlow' : 'heroHiveGlow';
  const filterId = isAuth ? 'authHexGlow' : 'heroHexGlow';

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden transition-opacity duration-500 ${className}`}
    >
      <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`${gradientId}Dark`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.09" />
            <stop offset="60%" stopColor="#D97706" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
          </linearGradient>

          <linearGradient id={`${gradientId}Light`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#D97706" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.01" />
          </linearGradient>

          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.3" />
          </filter>
        </defs>

        <g>
          {hexagons.map((hex, idx) => {
            const points = getHexPoints(hex.cx, hex.cy, hex.r);
            const innerPoints = hex.concentric
              ? getHexPoints(hex.cx, hex.cy, hex.r * 0.58)
              : null;

            const strokeColor = isDark
              ? hex.filled
                ? '#F59E0B'
                : 'rgba(255, 255, 255, 0.08)'
              : hex.filled
              ? '#F59E0B'
              : '#CBD5E1';

            const strokeOpacity = isDark
              ? hex.filled
                ? 0.22
                : 0.1
              : hex.filled
              ? 0.18
              : 0.55;

            const fillColor = hex.filled
              ? isDark
                ? `url(#${gradientId}Dark)`
                : `url(#${gradientId}Light)`
              : 'none';

            return (
              <g
                key={`hive-hex-${variant}-${idx}`}
                className={hex.pulse && isDark ? 'animate-pulse' : ''}
                style={{ transition: 'opacity 0.5s ease-in-out' }}
              >
                <polygon
                  points={points}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeOpacity={strokeOpacity}
                  strokeWidth={hex.filled ? 1.4 : 1.1}
                  strokeDasharray={hex.dashed ? '5 4' : undefined}
                  filter={isDark && hex.filled ? `url(#${filterId})` : undefined}
                />

                {innerPoints && (
                  <polygon
                    points={innerPoints}
                    fill="none"
                    stroke={strokeColor}
                    strokeOpacity={strokeOpacity * 0.7}
                    strokeWidth={0.8}
                    strokeDasharray="3 3"
                  />
                )}

                {hex.concentric && (
                  <circle
                    cx={hex.cx}
                    cy={hex.cy}
                    r={2}
                    fill={isDark ? '#FBBF24' : '#F59E0B'}
                    opacity={isDark ? 0.45 : 0.3}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

