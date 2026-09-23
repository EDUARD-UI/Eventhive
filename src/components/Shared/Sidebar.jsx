import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSettings, FiX } from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';

function Logo({ role }) {
  return (
    <div className="flex items-center gap-3 px-2 mb-6 mr-4 bg-white/5 p-2.5 rounded-2xl border border-white/10">
      <Link to="/" aria-label="Ir al inicio" className="shrink-0">
        <AppLogo showName={false} className="h-10 w-10 rounded-xl p-0.5 bg-white/10 shadow-sm" />
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 font-display font-bold text-sm text-white leading-tight">
          Event<span className="text-[#3b82f6]">Hive</span>
          <span className="text-[9px] font-bold text-slate-900 bg-accent px-1.5 py-0.5 rounded tracking-wider uppercase">
            {role}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-0.5">Tu evento. Conecta. Comparte</p>
      </div>
    </div>
  );
}

export default function Sidebar({
  role = 'Panel',
  items = [],
  activeItem,
  onSelect,
  variant = 'standard', // 'standard' | 'admin'
  isOpen = false,
  onClose = () => {},
}) {
  const isAdmin = variant === 'admin';
  const pageBg = '#f1f5f9';

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between pt-5 pb-5 pl-4 pr-0 text-white select-none">
      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        {/* Cabecera del Sidebar con botón de cierre en móvil */}
        <div className="flex items-center justify-between pr-3 md:block">
          <Logo role={role} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:text-white"
          >
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 mt-2">
          {items.map(({ id, label, icon: Icon, count }) => {
            const active = activeItem === id;
            return (
              <div key={id} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all text-left ${
                    active
                      ? isAdmin
                        ? 'bg-[#f1f5f9] text-slate-900 font-semibold rounded-l-2xl relative z-10'
                        : 'bg-[#087fea] text-white font-semibold rounded-lg mr-3 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 rounded-l-2xl mr-3'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} className={active && isAdmin ? 'text-brand' : 'text-slate-400'} />
                    <span>{label}</span>
                  </span>
                  {count && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        active
                          ? isAdmin
                            ? 'bg-brand-light text-brand'
                            : 'bg-white/20 text-white'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
                {active && isAdmin && (
                  <>
                    <span
                      className="absolute -top-5 right-0 w-5 h-5 pointer-events-none z-10 hidden md:block"
                      style={{
                        background: `radial-gradient(circle at 0 0, transparent 19px, ${pageBg} 19.5px)`,
                      }}
                    />
                    <span
                      className="absolute -bottom-5 right-0 w-5 h-5 pointer-events-none z-10 hidden md:block"
                      style={{
                        background: `radial-gradient(circle at 0 100%, transparent 19px, ${pageBg} 19.5px)`,
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-white/10 pt-4 mr-4">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 w-full"
        >
          <FiSettings size={15} /> Configuración
        </button>
        <Link
          to="/"
          className="mt-1 flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
        >
          <FiArrowLeft size={15} /> Volver a la plataforma
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar Escritorio (fijo/sticky) */}
      <aside className="hidden md:flex sticky top-0 h-screen min-h-screen w-64 shrink-0 self-start flex-col bg-[#131b2e] z-20">
        {sidebarContent}
      </aside>

      {/* Backdrop y Drawer Móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden transition-opacity"
          onClick={onClose}
        >
          <div
            className="fixed top-0 bottom-0 left-0 w-[280px] max-w-[85%] bg-[#131b2e] shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
