import { Link } from 'react-router-dom';
import { FiGlobe, FiMessageSquare, FiInstagram, FiMail } from 'react-icons/fi';
import EventHiveLogo from '../common/EventHiveLogo.jsx';

export default function Footer({ onHelpClick }) {
  return (
    <footer className="w-full bg-[#081028] text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <EventHiveLogo variant="horizontal" size={38} />
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              La mejor plataforma para descubrir y compartir eventos en Cartagena. Conectamos la cultura, el arte y el entretenimiento caribeño con la comunidad.
            </p>
          </div>

          {/* Col 1: Eventos */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Eventos
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/buscar" className="hover:text-brand transition-colors">
                  Todos los eventos
                </Link>
              </li>
              <li>
                <a href="#proximos" className="hover:text-brand transition-colors">
                  Próximos
                </a>
              </li>
              <li>
                <Link to="/categorias" className="hover:text-brand transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link to="/perfil" className="hover:text-brand transition-colors">
                  Mis favoritos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Organizadores */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Organizadores
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/organizador" className="hover:text-brand transition-colors">
                  Crear evento
                </Link>
              </li>
              <li>
                <Link to="/organizadores" className="hover:text-brand transition-colors">
                  Directorio
                </Link>
              </li>
              <li>
                <Link to="/registro" className="hover:text-brand transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onHelpClick}
                  className="hover:text-brand transition-colors text-left"
                >
                  Centro de ayuda
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Sobre */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Sobre
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <span className="cursor-pointer hover:text-brand transition-colors">
                  Acerca de
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand transition-colors">
                  Privacidad
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand transition-colors">
                  Términos
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-brand transition-colors">
                  Contacto
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 EventHive. Todos los derechos reservados.</p>
          <div className="flex items-center gap-3 text-slate-300">
            <a
              href="https://cartagena.travel"
              target="_blank"
              rel="noreferrer"
              aria-label="Sitio web"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-brand hover:text-white flex items-center justify-center transition-colors"
            >
              <FiGlobe size={15} />
            </a>
            <button
              type="button"
              onClick={onHelpClick}
              aria-label="Chat de soporte"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-brand hover:text-white flex items-center justify-center transition-colors"
            >
              <FiMessageSquare size={15} />
            </button>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-brand hover:text-white flex items-center justify-center transition-colors"
            >
              <FiInstagram size={15} />
            </a>
            <a
              href="mailto:contacto@eventhive.co"
              aria-label="Correo"
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-brand hover:text-white flex items-center justify-center transition-colors"
            >
              <FiMail size={15} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
