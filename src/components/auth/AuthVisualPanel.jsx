import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiMapPin, FiUsers } from 'react-icons/fi';
import cartagenaBg from '../../assets/cartagena-hero.jpg';
import HexagonalHivePattern from '../common/HexagonalHivePattern.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const BRAND_LETTERS = [
  { char: 'E', isHive: false },
  { char: 'v', isHive: false },
  { char: 'e', isHive: false },
  { char: 'n', isHive: false },
  { char: 't', isHive: false },
  { char: 'H', isHive: true },
  { char: 'i', isHive: true },
  { char: 'v', isHive: true },
  { char: 'e', isHive: true },
];

/**
 * AuthVisualPanel
 * Panel visual izquierdo (Escritorio >= 1024px).
 * - Fijo y sticky a la pantalla: no se inmuta ni se mueve si el formulario derecho se extiende o hace scroll.
 * - Nombre EventHive bajado hasta la mitad y ligeramente agrandado.
 */
export default function AuthVisualPanel() {
  const { isDark } = useTheme();
  const [animKey, setAnimKey] = useState(0);

  const handleReplayBrandAnimation = () => {
    setAnimKey((prev) => prev + 1);
  };

  return (
    <aside className={`hidden lg:flex lg:w-[48%] xl:w-[48%] h-full shrink-0 relative flex-col items-center justify-between p-8 sm:p-10 lg:px-12 lg:pb-8 lg:pt-[33vh] overflow-hidden select-none border-r transition-colors duration-300 ${
      isDark
        ? 'bg-[#091322] text-white border-[#1E3A5F]'
        : 'bg-[#F8F9FA] text-[#0F2342] border-[#E2E8F0]'
    }`}>
      {/* 1. Fotografía de fondo arquitectónico de la Heroica */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out hover:scale-103 opacity-40 dark:opacity-25 pointer-events-none"
        style={{ backgroundImage: `url('${cartagenaBg}')` }}
      />

      {/* 2. Capa sólida clara / oscura para contraste de alta nitidez */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-[#091322]/85'
            : 'bg-[#F8F9FA]/85'
        }`}
      />

      {/* 3. Hexágonos geométricos del panal de EventHive */}
      <HexagonalHivePattern variant="auth" className="opacity-75 dark:opacity-40" />

      {/* 4. Nombre EventHive alineado a la altura visual del input de correo (~32%–35% desde arriba) */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center text-center">
        <Link
          to="/"
          onMouseEnter={handleReplayBrandAnimation}
          onFocus={handleReplayBrandAnimation}
          aria-label="EventHive"
          className="inline-flex items-baseline focus:outline-none cursor-pointer transform hover:scale-[1.02] transition-transform duration-200"
        >
          <span
            key={`brand-${animKey}`}
            aria-hidden="true"
            className="font-display text-6xl sm:text-7xl xl:text-[4.75rem] font-black leading-none tracking-tight inline-flex items-baseline drop-shadow-sm text-center"
          >
            {BRAND_LETTERS.map(({ char, isHive }, index) => (
              <span
                key={`brand-letter-${char}-${index}`}
                style={{ animationDelay: `${index * 80}ms` }}
                className={`inline-block animate-auth-letter ${
                  isHive
                    ? 'text-[#F5B800]'
                    : isDark
                    ? 'text-white'
                    : 'text-[#0F2342]'
                }`}
              >
                {char}
              </span>
            ))}
          </span>
        </Link>
      </div>

      {/* 5. Contenido Editorial Inferior 100% Centrado (max-width: 480px) */}
      <div className="relative z-10 mt-auto flex flex-col items-center text-center space-y-4 max-w-[480px] w-full mx-auto">
        <div>
          <h2 className={`font-display text-2xl sm:text-3xl lg:text-[1.85rem] font-black leading-tight text-center ${
            isDark ? 'text-white' : 'text-[#0F2342]'
          }`}>
            Vive la <span className="text-[#F5B800]">Magia</span> de la Heroica, evento a evento.
          </h2>
          <p className={`text-xs sm:text-sm mt-2 leading-relaxed text-center ${
            isDark ? 'text-slate-300' : 'text-[#64748B]'
          }`}>
            Descubre música, festivales, gastronomía y cultura local. Gestiona tus entradas o publica tus propios eventos de forma ágil y segura.
          </p>
        </div>

        {/* Lista limpia con íconos circulares en Amarillo Ámbar #F5B800 */}
        <div className={`space-y-2 pt-3 border-t w-full inline-flex flex-col items-center text-center ${
          isDark ? 'border-white/10' : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold max-w-sm w-full text-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#F5B800]/20 text-[#F5B800]">
              <FiCheck className="text-sm" />
            </div>
            <span className={isDark ? 'text-slate-200' : 'text-[#0F2342]'}>
              Boletos 100% verificados con código QR digital
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold max-w-sm w-full text-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#F5B800]/20 text-[#F5B800]">
              <FiMapPin className="text-sm" />
            </div>
            <span className={isDark ? 'text-slate-200' : 'text-[#0F2342]'}>
              Geolocalización y mapa interactivo en tiempo real
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold max-w-sm w-full text-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-[#F5B800]/20 text-[#F5B800]">
              <FiUsers className="text-sm" />
            </div>
            <span className={isDark ? 'text-slate-200' : 'text-[#0F2342]'}>
              Comunidad activa de asistentes y organizaciones
            </span>
          </div>
        </div>

        {/* Pie Centrado con Copyright y Enlace Explorar cartelera con Tooltip "Regresar al inicio" */}
        <div className={`pt-2 w-full flex items-center justify-between text-xs ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}>
          <span className="font-mono text-[11px]">© 2026 EventHive. Todos los derechos reservados.</span>
          <div className="relative group">
            <Link
              to="/"
              className="font-bold text-[#F5B800] hover:underline cursor-pointer"
            >
              Explorar cartelera
            </Link>
            <div className="absolute right-0 -top-8 hidden group-hover:flex items-center px-2.5 py-1 rounded-[6px] bg-[#0F2342] text-white text-[10px] font-mono whitespace-nowrap shadow-xl border border-white/10 z-30 pointer-events-none">
              Regresar al inicio
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}