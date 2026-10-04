import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import AppLogo from "../common/AppLogo.jsx";
import { session, normalizeRole, getDashboardPathForRole } from "../../services/session.js";

export default function Navbar() {
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

  return (
    <>
      <header className="sticky top-0 z-40 flex w-full items-center justify-between gap-3 px-4 py-3.5 backdrop-blur-md bg-[#0B132B]/95 text-white border-b border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-colors sm:px-6 xl:px-10">
        <Link to="/" className="flex shrink-0 items-center group">
          <AppLogo
            className="h-9 w-fit"
            textClassName="text-white"
            hiveClassName="text-amber-400"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-sm font-medium 2xl:gap-7 xl:flex">
          {NAV_LINKS.map((link) =>
            link.label === "Ayuda" ? (
              <button
                key={link.label}
                type="button"
                onClick={openHelp}
                className="text-slate-300 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-colors duration-200 ${
                  location.pathname === link.href
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          {currentUser ? (
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                to={panelPath}
                className="flex max-w-[240px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold border border-slate-700/80 bg-[#131E3A] text-white hover:border-amber-400 hover:text-amber-300 transition-all duration-200"
              >
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="truncate">{currentUser.name || 'Mi Cuenta'}</span>
                {role && role !== 'CLIENTE' && (
                  <span className="ml-1 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {role}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-200"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 xl:flex">
              <button
                type="button"
                onClick={() => navigate("/iniciosesion")}
                className="inline-flex whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold border border-slate-700 text-slate-200 hover:border-slate-500 hover:text-white transition-all duration-200 active:scale-95"
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => navigate("/registro")}
                className="inline-flex whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all duration-200 active:scale-95"
              >
                Registrarse
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={open}
            aria-label="Abrir menú"
            aria-expanded={isOpen}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-800 hover:text-white transition-colors duration-200 xl:hidden"
          >
            <FiMenu size={22} />
          </button>
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
