import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiLogOut, FiSun, FiMoon } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import AppLogo from "../common/AppLogo.jsx";
import { session, normalizeRole, getDashboardPathForRole } from "../../services/session.js";
import { useTheme } from "../../context/ThemeContext.jsx";

/**
 * Navbar Global de EventHive
 * Soporta cambio dinámico de tema claro/oscuro, barra de progreso superior en tiempo real y diseño responsive.
 */
export default function Navbar({ variant = 'dark', embedded = false }) {
  const { isOpen, open, close } = useDisclosure(false);
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const progressBarRef = useRef(null);
  const { theme, toggleTheme, isDark } = useTheme();

  // Seguimiento instantáneo y continuo del scroll en tiempo real (60-120 FPS sin retraso CSS)
  useEffect(() => {
    const updateProgress = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = totalScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / totalScroll)) : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio})`;
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [location.pathname]);

  useEffect(() => {
    setCurrentUser(session.getUser());
    close();
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    session.clear();
    setCurrentUser(null);
    close();
    navigate('/');
  };

  const role = normalizeRole(currentUser?.role || currentUser?.rol);
  const panelPath = getDashboardPathForRole(role);

  return (
    <>
      <header
        className={`w-full transition-colors duration-200 ${embedded
            ? 'relative z-30 bg-transparent border-none shadow-none'
            : `sticky top-0 z-50 backdrop-blur-md ${isDark
              ? 'bg-[#0B0F19]/80 text-white border-b border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              : 'bg-white/85 text-slate-800 border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]'
            }`
          }`}
      >
        {/* Barra de progreso de scroll en tiempo real continuo (arriba de la navbar) */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-slate-200/30 dark:bg-white/10 pointer-events-none overflow-hidden z-50">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
            style={{ transform: 'scaleX(0)', willChange: 'transform' }}
          />
        </div>

        <div
          className={`mx-auto flex w-full items-center justify-between lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] ${embedded
              ? `max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-8 xl:px-12 ${isDark ? 'text-white' : 'text-slate-800'
              }`
              : 'max-w-7xl gap-3 px-4 py-3 sm:px-6 xl:px-10'
            }`}
        >
          {/* Logo de Marca con Tooltip Explicativo "Volver" */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-5 lg:justify-self-start">
            <div className="relative group/logo">
              <Link
                to="/"
                aria-label="Volver al inicio"
                className="flex shrink-0 items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
              >
                <AppLogo
                  className="h-8 sm:h-9 w-fit"
                  textClassName={isDark ? 'text-white' : 'text-[#0B132B]'}
                  hiveClassName="text-amber-500"
                  showImage={false}
                />
              </Link>

              {/* Mensaje emergente en hover: blanco en modo oscuro, azul oscuro en modo claro */}
              <div className="absolute top-full left-0 mt-2 px-2.5 py-1 rounded-md bg-[#0B132B] text-white dark:bg-white dark:text-slate-950 text-[11px] font-bold shadow-md opacity-0 pointer-events-none group-hover/logo:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50">
                Volver al inicio
                <div className="absolute -top-1 left-4 w-2 h-2 bg-[#0B132B] dark:bg-white rotate-45" />
              </div>
            </div>
          </div>

          {/* Menú de Navegación Central */}
          <nav className="hidden min-w-0 items-center justify-center gap-4 text-sm font-medium xl:gap-6 lg:flex lg:justify-self-center">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return link.label === "Ayuda" ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={openHelp}
                  className={`transition-all duration-200 cursor-pointer font-medium px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-[#0B132B] hover:bg-slate-100/70'
                    }`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`transition-all duration-200 px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isActive
                      ? isDark
                        ? 'text-amber-400 font-bold border-b-2 border-amber-400 rounded-b-none'
                        : 'text-slate-950 font-bold border-b-2 border-amber-600 rounded-b-none'
                      : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-slate-600 hover:text-[#0B132B] hover:bg-slate-100/70'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones, Botón Tema y Autenticación */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:justify-self-end">
            {/* Botón de alternar Tema Claro / Oscuro con estados accesibles y alto contraste */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar tema claro y oscuro"
              className={`p-2 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${isDark
                  ? 'border-white/10 bg-slate-800/60 text-amber-400 hover:bg-slate-800 hover:text-amber-300 hover:border-amber-400/50 focus-visible:ring-offset-[#0B0F19]'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-amber-700 hover:border-amber-400/60 focus-visible:ring-offset-white'
                }`}
            >
              {isDark ? (
                <FiSun size={17} className="text-amber-400" />
              ) : (
                <FiMoon size={17} className="text-slate-700" />
              )}
            </button>

            {currentUser ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to={panelPath}
                  className={`flex max-w-[240px] items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isDark
                      ? 'border border-white/10 bg-[#131E3A] text-white hover:border-amber-400 hover:text-amber-300'
                      : 'border border-slate-200 bg-slate-50/90 text-[#0B132B] hover:border-amber-500 hover:text-amber-800'
                    }`}
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-[#0B132B] flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="truncate">{currentUser.name || 'Mi Cuenta'}</span>
                  {role && role !== 'CLIENTE' && (
                    <span className={`ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${isDark
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                      {role}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className={`p-2 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${isDark
                      ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <div className={`hidden items-center gap-3 sm:gap-4 lg:flex pl-2 sm:pl-3 border-l ${isDark ? 'border-white/10' : 'border-slate-200'
                }`}>
                <button
                  type="button"
                  onClick={() => navigate("/iniciosesion")}
                  className={`inline-flex whitespace-nowrap rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isDark
                      ? 'border border-white/15 bg-white/5 text-slate-100 hover:border-amber-400 hover:bg-white/10'
                      : 'border border-slate-300 text-[#0B132B] hover:border-slate-400 hover:bg-slate-100'
                    }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/registro")}
                  className="inline-flex whitespace-nowrap rounded-full px-6 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Botón de Menú Móvil con focus-visible accesible */}
            <button
              type="button"
              onClick={open}
              aria-label="Abrir menú"
              aria-expanded={isOpen}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${isDark
                  ? 'text-slate-200 hover:bg-slate-800 hover:text-white border border-white/10'
                  : 'text-[#0B132B] hover:bg-slate-100 border border-slate-200/80'
                }`}
            >
              <FiMenu size={22} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={isOpen}
        onClose={close}
        onHelpClick={openHelp}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      <HelpChat isOpen={isHelpOpen} onClose={closeHelp} onOpen={openHelp} />
    </>
  );
}