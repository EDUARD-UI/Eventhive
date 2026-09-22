import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiUser, FiLogOut } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import EventHiveLogo from "../common/EventHiveLogo.jsx";
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
    navigate('/');
  };

  return (
    <>
      <header className="flex items-center justify-between px-6 sm:px-10 py-3.5 border-b border-borderc bg-white/95 backdrop-blur-md sticky top-0 z-30 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <Link to="/" className="flex items-center group">
          <EventHiveLogo variant="horizontal" size={38} />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[14.5px] font-medium">
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

        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to={currentUser.role === 'ADMIN' ? '/admin' : currentUser.role === 'ORGANIZADOR' ? '/organizacion' : '/perfil'}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-borderc bg-slate-50 text-xs font-semibold text-ink hover:border-brand hover:text-brand transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span>{currentUser.name || 'Mi Cuenta'}</span>
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
            <>
              <button
                onClick={() => navigate("/iniciosesion")}
                className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs font-semibold border border-borderc hover:border-brand hover:text-brand transition-all active:scale-95"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => navigate("/registro")}
                className="hidden md:inline-flex px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand hover:bg-brand-dark shadow-sm hover:shadow transition-all active:scale-95"
              >
                Registrarse
              </button>
            </>
          )}

          <button
            onClick={open}
            aria-label="Abrir menú"
            className="md:hidden p-1.5 text-slate-700 hover:text-brand"
          >
            <FiMenu size={22} />
          </button>
        </div>
      </header>

      <MobileDrawer isOpen={isOpen} onClose={close} onHelpClick={openHelp} />
      <HelpChat isOpen={isHelpOpen} onClose={closeHelp} />
    </>
  );
}
