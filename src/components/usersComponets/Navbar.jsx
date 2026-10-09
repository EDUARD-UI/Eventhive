import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import AppLogo from "../common/AppLogo.jsx";
import { session, normalizeRole, getDashboardPathForRole } from "../../services/session.js";

/**
 * Navbar Global de EventHive
 * Soporta variante "light", "dark" y modo "embedded" (integrado dentro del Hero sin divisiones).
 */
export default function Navbar({ variant = 'dark', embedded = false }) {
  const { isOpen, open, close } = useDisclosure(false);
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

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
  const isLight = variant === 'light';

  return (
    <>
      <header
        className={`w-full transition-all ${
          embedded
            ? 'relative z-30 bg-transparent border-none shadow-none'
            : `sticky top-0 z-50 backdrop-blur-md ${
                isLight
                  ? 'bg-white/95 text-slate-800 border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]'
                  : 'bg-[#0B132B]/95 text-white border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)]'
              }`
        }`}
      >
        <div
          className={`mx-auto flex w-full items-center justify-between ${
            embedded
              ? `max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-5 md:px-8 xl:px-12 ${
                  isLight ? 'text-slate-800' : 'text-white'
                }`
              : 'max-w-7xl gap-3 px-4 py-3.5 sm:px-6 xl:px-10'
          }`}
        >
        {/* Logo de Marca */}
        <Link to="/" className="flex shrink-0 items-center group">
          <AppLogo
            className="h-9 w-fit"
            textClassName={isLight ? 'text-[#0B132B]' : 'text-white'}
            hiveClassName="text-amber-500"
            showImage={false}
          />
        </Link>

        {/* Menú de Navegación Central */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-sm font-medium 2xl:gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname === link.href;
            return link.label === "Ayuda" ? (
              <button
                key={link.label}
                type="button"
                onClick={openHelp}
                className={`transition-colors duration-200 cursor-pointer font-medium ${
                  isLight
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
                    ? isLight
                      ? 'text-[#0B132B] font-bold border-b-2 border-amber-500'
                      : 'text-amber-400 font-bold border-b-2 border-amber-400'
                    : isLight
                    ? 'text-slate-600 hover:text-[#0B132B]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones y Autenticación */}
        <div className="flex shrink-0 items-center gap-2.5">
          {currentUser ? (
            <div className="hidden items-center gap-2 lg:flex">
              <Link
                to={panelPath}
                className={`flex max-w-[240px] items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-xs ${
                  isLight
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
                  isLight
                    ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 lg:flex">
              <button
                type="button"
                onClick={() => navigate("/iniciosesion")}
                className={`inline-flex whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                  isLight
                    ? 'border border-slate-300 text-[#0B132B] hover:border-slate-500 hover:bg-slate-50'
                    : 'border border-slate-600/80 bg-white/5 text-white hover:border-amber-400 hover:bg-white/10'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => navigate("/registro")}
                className="inline-flex whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-[#0B132B] shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
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
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 cursor-pointer lg:hidden ${
              isLight
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