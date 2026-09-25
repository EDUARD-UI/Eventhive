import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiLogOut } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import AppLogo from "../common/AppLogo.jsx";
import { session } from "../../services/session.js";

export default function Navbar() {
  const { isOpen, open, close } = useDisclosure(false);
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useDisclosure(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // session.getUser() ya guarda el rol normalizado ("ORGANIZADOR" en
    // vez del "REPRESENTANTE" que usa el backend), así que las
    // comparaciones de abajo (ADMIN / ORGANIZADOR) siguen funcionando
    // igual que antes.
    setCurrentUser(session.getUser());
  }, [location.pathname]);

  const handleLogout = () => {
    session.clear();
    setCurrentUser(null);
    close();
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-3 border-b border-borderc bg-white/95 px-4 py-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all sm:px-6 xl:px-10">
        <Link to="/" className="flex shrink-0 items-center group">
          <AppLogo className="h-10 w-fit" />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-sm font-medium 2xl:gap-7 xl:flex">
          {NAV_LINKS.map((link) =>
            link.label === "Ayuda" ? (
              <button
                key={link.label}
                type="button"
                onClick={openHelp}
                className="text-slate-600 hover:text-brand transition-colors"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-colors ${
                  location.pathname === link.href
                    ? 'text-brand font-semibold'
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
                to={currentUser.role === 'ADMIN' ? '/admin' : currentUser.role === 'ORGANIZADOR' ? '/organizacion' : '/perfil'}
                className="flex max-w-[220px] items-center gap-2 rounded-xl border border-borderc bg-slate-50 px-3.5 py-2 text-xs font-semibold text-ink transition-all hover:border-brand hover:text-brand"
              >
                <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="truncate">{currentUser.name || 'Mi Cuenta'}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <FiLogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2.5 xl:flex">
              <button
                onClick={() => navigate("/iniciosesion")}
                className="inline-flex whitespace-nowrap rounded-xl border border-borderc px-4 py-2 text-xs font-semibold transition-all hover:border-brand hover:text-brand active:scale-95"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/registro")}
                className="inline-flex whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow active:scale-95"
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
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand xl:hidden"
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
   