import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiLogOut, FiSearch, FiSun, FiMoon } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import AppLogo from "../common/AppLogo.jsx";
import { session, normalizeRole, getDashboardPathForRole } from "../../services/session.js";
import { useTheme } from "../../context/ThemeContext.jsx";

/**
 * Navbar Global de EventHive
 * Soporta cambio dinámico de tema claro/oscuro, buscador integrado y diseño responsive.
 */
export default function Navbar({ variant = 'dark', embedded = false }) {
  const { isOpen, open, close } = useDisclosure(false);
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme, isDark } = useTheme();

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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/buscar?titulo=${encodeURIComponent(query)}`);
    } else {
      navigate('/buscar');
    }
  };

  const role = normalizeRole(currentUser?.role || currentUser?.rol);
  const panelPath = getDashboardPathForRole(role);
  // Requisito: en modo oscuro el hero se queda oscuro y la navbar se pasa a blanca; en modo claro, lo inverso
  const isNavbarWhite = isDark;

  return (
    <>
      <header
        className={`w-full transition-colors duration-200 ${
          embedded
            ? 'relative z-30 bg-transparent border-none shadow-none'
            : `sticky top-0 z-50 backdrop-blur-md ${
                isNavbarWhite
                  ? 'bg-white/95 text-slate-800 border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]'
                  : 'bg-[#0B132B]/95 text-white border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              }`
        }`}
      >
        <div
          className={`mx-auto flex w-full items-center justify-between ${
            embedded
              ? `max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-8 xl:px-12 ${
                  isNavbarWhite ? 'text-slate-800' : 'text-white'
                }`
              : 'max-w-7xl gap-3 px-4 py-3 sm:px-6 xl:px-10'
          }`}
        >
          {/* Logo de Marca y Buscador */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <Link to="/" className="flex shrink-0 items-center group">
              <AppLogo
                className="h-8 sm:h-9 w-fit"
                textClassName={isNavbarWhite ? 'text-[#0B132B]' : 'text-white'}
                hiveClassName="text-amber-500"
                showImage={false}
              />
            </Link>

            {/* Buscador integrado en la Navbar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden sm:flex items-center w-48 md:w-60 lg:w-72 transition-all"
            >
              <FiSearch
                size={14}
                className={`absolute left-3.5 pointer-events-none transition-colors ${
                  isNavbarWhite ? 'text-slate-400' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar eventos..."
                className={`w-full h-9 pl-9 pr-3 rounded-full text-xs font-medium outline-none transition-all duration-200 ${
                  isNavbarWhite
                    ? 'bg-slate-100 text-slate-800 placeholder-slate-400 border border-slate-200/90 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20'
                    : 'bg-white/10 text-white placeholder-slate-400 border border-white/10 focus:bg-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                }`}
              />
            </form>
          </div>

          {/* Menú de Navegación Central */}
          <nav className="hidden min-w-0 items-center justify-center gap-5 text-sm font-medium xl:gap-7 lg:flex">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.href;
              return link.label === "Ayuda" ? (
                <button
                  key={link.label}
                  type="button"
                  onClick={openHelp}
                  className={`transition-colors duration-200 cursor-pointer font-medium ${
                    isNavbarWhite
                      ? 'text-slate-600 hover:text-[#0B132B]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`transition-all duration-200 py-1 ${
                    isActive
                      ? isNavbarWhite
                        ? 'text-[#0B132B] font-bold border-b-2 border-amber-500'
                        : 'text-amber-400 font-bold border-b-2 border-amber-400'
                      : isNavbarWhite
                      ? 'text-slate-600 hover:text-[#0B132B]'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Acciones, Botón Tema y Autenticación */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            {/* Botón de alternar Tema Claro / Oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-label="Alternar tema claro y oscuro"
              className={`p-2 rounded-full border transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center ${
                isNavbarWhite
                  ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-amber-400'
                  : 'border-slate-700/80 bg-white/5 text-amber-400 hover:bg-white/10 hover:border-amber-400'
              }`}
            >
              {isDark ? (
                <FiSun size={17} className="text-amber-500" />
              ) : (
                <FiMoon size={17} className="text-amber-400" />
              )}
            </button>

            {currentUser ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Link
                  to={panelPath}
                  className={`flex max-w-[240px] items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-xs ${
                    isNavbarWhite
                      ? 'border border-slate-200 bg-slate-50/90 text-[#0B132B] hover:border-amber-400 hover:text-amber-700'
                      : 'border border-slate-700/80 bg-[#131E3A] text-white hover:border-amber-400 hover:text-amber-300'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-[#0B132B] flex items-center justify-center text-[10px] font-black shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="truncate">{currentUser.name || 'Mi Cuenta'}</span>
                  {role && role !== 'CLIENTE' && (
                    <span className="ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-700 border border-amber-400/40">
                      {role}
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className={`p-2 rounded-full transition-colors duration-200 cursor-pointer ${
                    isNavbarWhite
                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  <FiLogOut size={16} />
                </button>
              </div>
            ) : (
              <div className={`hidden items-center gap-3 sm:gap-4 lg:flex pl-2 sm:pl-3 border-l ${
                isNavbarWhite ? 'border-slate-200' : 'border-slate-800'
              }`}>
                <button
                  type="button"
                  onClick={() => navigate("/iniciosesion")}
                  className={`inline-flex whitespace-nowrap rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                    isNavbarWhite
                      ? 'border border-slate-300 text-[#0B132B] hover:border-slate-500 hover:bg-slate-50'
                      : 'border border-slate-600/80 bg-white/5 text-white hover:border-amber-400 hover:bg-white/10'
                  }`}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/registro")}
                  className="inline-flex whitespace-nowrap rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Botón de Menú Móvil */}
            <button
              type="button"
              onClick={open}
              aria-label="Abrir menú"
              aria-expanded={isOpen}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer lg:hidden ${
                isNavbarWhite
                  ? 'text-[#0B132B] hover:bg-slate-100'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
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
      <HelpChat isOpen={isHelpOpen} onClose={closeHelp} />
    </>
  );
}