import { FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../constants/navigation.js';

export default function MobileDrawer({ isOpen, onClose, onHelpClick, currentUser, onLogout }) {
  if (!isOpen) return null;

  const accountPath = currentUser?.role === 'ADMIN'
    ? '/admin'
    : currentUser?.role === 'ORGANIZADOR'
      ? '/organizacion'
      : '/perfil';

  return (
    <div
      className="fixed inset-0 bg-ink/50 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        className="absolute bottom-0 right-0 top-0 flex w-[82%] max-w-[360px] flex-col gap-1 overflow-y-auto bg-white p-5 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-full border border-borderc"
        >
          <FiX />
        </button>

        {NAV_LINKS.map((link) => (
          link.label === 'Ayuda' ? (
            <button
              key={link.label}
              type="button"
              onClick={() => {
                onClose();
                onHelpClick();
              }}
              className="border-b border-borderc px-2 py-3 text-left text-[15px] font-semibold"
            >
              {link.label}
            </button>
          ) : (
            <Link
              key={link.label}
              to={link.href}
              onClick={onClose}
              className="border-b border-borderc px-2 py-3 text-[15px] font-semibold"
            >
              {link.label}
            </Link>
          )
        ))}

        {currentUser ? (
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to={accountPath}
              onClick={onClose}
              className="w-full rounded-lg border border-borderc px-3 py-2.5 text-center text-sm font-semibold"
            >
              {currentUser.name || 'Mi cuenta'}
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              to="/iniciosesion"
              onClick={onClose}
              className="w-full rounded-lg border border-borderc px-3 py-2.5 text-center text-sm font-semibold"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              onClick={onClose}
              className="w-full rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
