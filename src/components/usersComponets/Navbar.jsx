import { FiMenu } from "react-icons/fi";
import { NAV_LINKS } from "../../constants/navigation.js";
import MobileDrawer from "../MobileDrawer.jsx";
import HelpChat from "../HelpChat.jsx";
import { useDisclosure } from "../../hooks/useDisclosure.js";
import InicioSesion from "../../pages/InicioSesion.jsx";
import Registro from "../../pages/Registro.jsx";
import { useNavigate } from 'react-router-dom';
import logoEventhive from "../../assets/logo-eventhive.jpg";

export default function Navbar() {
  const { isOpen, open, close } = useDisclosure(false);
  const { isOpen: isHelpOpen, open: openHelp, close: closeHelp } = useDisclosure(false);
  const navigate = useNavigate();
  return (
    <>
      <header className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-borderc bg-white relative z-20">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src={logoEventhive}
            alt="EventHive"
            className="h-9 w-auto object-contain shrink-0"
          />
          <div className="flex items-center gap-1 font-display font-bold text-xl text-ink">
            Event<span className="text-brand">Hive</span>
            <span className="text-[10px] font-bold text-brand bg-brand-light px-1.5 py-0.5 rounded ml-1">
              CTG
            </span>
          </div>
        </a>

        <nav className="hidden md:flex gap-7 text-[14.5px] font-medium">
          {NAV_LINKS.map((link) =>
            link.label === "Ayuda" ? (
              <button
                key={link.label}
                onClick={openHelp}
                className="opacity-75 hover:opacity-100 hover:text-brand transition"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="opacity-75 hover:opacity-100 hover:text-brand transition"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/iniciosesion")}
            className="hidden md:inline-flex px-4 py-2.5 rounded-lg text-sm font-semibold border border-borderc hover:border-brand hover:text-brand transition-colors"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/registro")}
            className="hidden md:inline-flex px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand-dark transition-colors"
          >
            Registrarse
          </button>
          <button
            onClick={open}
            aria-label="Abrir menú"
            className="md:hidden p-1.5"
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