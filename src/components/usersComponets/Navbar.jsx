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

  const isHome = location.pathname === '/';

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex w-full items-center justify-between gap-3 px-4 py-3.5 backdrop-blur-md transition-all sm:px-6 xl:px-10 ${
          isHome
            ? 'bg-[#0D1527]/90 text-white border-b border-amber-400/20 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
            : 'bg-white/95 text-slate-900 border-b border-borderc shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
        }`}
      >
        <Link to="/" className="flex shrink-0 items-center group">
          <AppLogo
            className="h-10 w-fit"
            textClassName={isHome ? 'text-white' : 'text-slate-900'}
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
                className={`transition-colors ${
                  isHome ? 'text-slate-300 hover:text-amber-400' : 'text-slate-600 hover:text-brand'
                }`}
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-colors ${
                  location.pathname === link.href
                    ? isHome
                      ? 'text-amber-400 font-bold'
                      : 'text-brand font-semibold'
                    : isHome
                    ? 'text-slate-300 hover:text-amber-400'
                    : 'text-slate-600 hover:text-brand'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {currentUser ? (
            <div className="hidden items-center gap-2 xl:flex">
              <Link
                to={panelPath}
                className={`flex max-w-[240px] items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isHome
                    ? 'border border-amber-400/30 bg-[#131D36] text-white hover:border-amber-400 hover:text-amber-300'
                    : 'border border-borderc bg-slate-50 text-ink hover:border-brand hover:text-brand'
                }`}
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
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 xl:flex">
              <button
                onClick={() => navigate("/iniciosesion")}
                className={`inline-flex whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  isHome
                    ? 'border border-slate-700 bg-transparent text-slate-200 hover:border-amber-400 hover:text-amber-300'
                    : 'border border-borderc hover:border-brand hover:text-brand'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/registro")}
                className={`inline-flex whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 ${
                  isHome
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-md shadow-amber-500/20'
                    : 'bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow'
                }`}
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
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors xl:hidden ${
              isHome ? 'text-slate-200 hover:bg-slate-800 hover:text-amber-400' : 'text-slate-700 hover:bg-slate-100 hover:text-brand'
            }`}
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
