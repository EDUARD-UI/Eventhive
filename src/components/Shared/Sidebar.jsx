import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMenu, FiX } from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';

export default function Sidebar({
  role = 'Panel',
  items = [],
  activeItem,
  onSelect,
  variant = 'standard', // 'standard' | 'admin'
  isOpen = false,
  onClose = () => {},
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
}) {
  const isAdmin = variant === 'admin';
  const pageBg = '#f1f5f9';

  // Manejo de estado colapsado (con persistencia en localStorage para UX fluida)
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(() => {
    try {
      return localStorage.getItem('eventhive_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const isCollapsed =
    controlledCollapsed !== undefined ? controlledCollapsed : uncontrolledCollapsed;

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    if (onToggleCollapse) {
      onToggleCollapse(nextState);
    }
    if (controlledCollapsed === undefined) {
      setUncontrolledCollapsed(nextState);
      try {
        localStorage.setItem('eventhive_sidebar_collapsed', String(nextState));
      } catch {
        // Ignorar posibles errores en entornos restringidos de localStorage
      }
    }
  };

  // Renderizado del contenido interno del Sidebar
  const renderContent = (isDrawer = false) => {
    // Si estamos dentro del drawer móvil, siempre se muestra expandido para fácil navegación
    const collapsed = isDrawer ? false : isCollapsed;

    return (
      <div
        className={`flex h-full flex-col justify-between pt-4 pb-5 text-white select-none transition-all duration-300 ${
          collapsed ? 'px-2' : 'pl-4 pr-0'
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          {/* Cabecera del Sidebar */}
          {collapsed ? (
            /* Cabecera en estado Colapsado (Desktop) */
            <div className="flex flex-col items-center gap-3 mb-6 pt-1">
              <Link
                to="/"
                aria-label="Ir al inicio"
                title={`EventHive (${role})`}
                className="group flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 p-1 transition-all group-hover:scale-105 group-hover:bg-white/15"
              >
                <AppLogo showName={false} className="h-5 w-5 shrink-0" />
              </Link>
              <button
                type="button"
                onClick={handleToggleCollapse}
                aria-label="Expandir barra lateral"
                title="Expandir barra lateral"
                className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <FiMenu size={16} />
              </button>
            </div>
          ) : (
            /* Cabecera en estado Expandido (Desktop y Móvil) */
            <div className="flex items-center justify-between pr-3 mb-5 pt-1">
              <Link
                to="/"
                aria-label="Ir al inicio"
                className="group flex items-center gap-2.5 min-w-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/10 p-1 transition-all group-hover:scale-105 group-hover:bg-white/15 shadow-sm">
                  <AppLogo showName={false} className="h-5 w-5 shrink-0" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 font-display text-sm font-bold text-white leading-none whitespace-nowrap">
                    <span>Event</span>
                    <span className="text-[#087fea]">Hive</span>
                  </div>
                  <span className="mt-1 inline-block w-fit text-[9px] font-bold text-slate-900 bg-accent px-1.5 py-0.5 rounded tracking-wider uppercase leading-none truncate">
                    {role}
                  </span>
                </div>
              </Link>

              {/* Botón de cierre en Móvil o botón de colapso en Desktop */}
              {isDrawer ? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar menú"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
                >
                  <FiX size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  aria-label="Colapsar barra lateral"
                  title="Colapsar barra lateral"
                  className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                >
                  <FiMenu size={16} />
                </button>
              )}
            </div>
          )}

          {/* Lista de navegación */}
          <nav
            className={`flex flex-col gap-1.5 mt-2 transition-all ${
              collapsed ? 'items-center' : ''
            }`}
          >
            {items.map(({ id, label, icon: Icon, count }) => {
              const active = activeItem === id;

              if (collapsed) {
                // Modo colapsado: Solo icono centrado con tooltip nativo y badge
                return (
                  <div key={id} className="relative w-full flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(id);
                        onClose();
                      }}
                      title={count ? `${label} (${count})` : label}
                      aria-label={label}
                      className={`relative flex h-11 w-11 items-center justify-center rounded-xl text-sm transition-all group ${
                        active
                          ? isAdmin
                            ? 'bg-[#f1f5f9] text-slate-900 font-semibold shadow-md'
                            : 'bg-[#087fea] text-white font-semibold shadow-md shadow-[#087fea]/25'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon
                        size={19}
                        className={`transition-transform duration-200 group-hover:scale-110 ${
                          active
                            ? isAdmin
                              ? 'text-brand'
                              : 'text-white'
                            : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      {count && (
                        <span
                          className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-bold ${
                            active
                              ? isAdmin
                                ? 'bg-brand text-white ring-2 ring-[#131b2e]'
                                : 'bg-white text-[#087fea] ring-2 ring-[#131b2e]'
                              : 'bg-[#087fea] text-white ring-2 ring-[#131b2e]'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  </div>
                );
              }

              // Modo expandido: Icono + Texto + Contador
              return (
                <div key={id} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm transition-all text-left group ${
                      active
                        ? isAdmin
                          ? 'bg-[#f1f5f9] text-slate-900 font-semibold rounded-l-2xl relative z-10'
                          : 'bg-[#087fea] text-white font-semibold rounded-xl mr-3 shadow-md shadow-[#087fea]/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 rounded-l-2xl mr-3'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${
                          active
                            ? isAdmin
                              ? 'text-brand'
                              : 'text-white'
                            : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{label}</span>
                    </span>
                    {count && (
                      <span
                        className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
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
                  {active && isAdmin && !isDrawer && (
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

        {/* Pie del Sidebar: Volver a la plataforma */}
        <div
          className={`shrink-0 border-t border-white/10 pt-4 transition-all ${
            collapsed ? 'flex justify-center' : 'mr-3'
          }`}
        >
          {collapsed ? (
            <Link
              to="/"
              title="Volver a la plataforma"
              aria-label="Volver a la plataforma"
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5 active:scale-95"
            >
              <FiArrowLeft size={18} />
            </Link>
          ) : (
            <Link
              to="/"
              className="mt-1 flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
            >
              <FiArrowLeft size={16} className="shrink-0" />
              <span className="truncate">Volver a la plataforma</span>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar Escritorio (fijo/sticky) con ancho dinámico animado */}
      <aside
        className={`hidden md:flex sticky top-0 h-screen min-h-screen shrink-0 self-start flex-col bg-[#131b2e] z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Backdrop y Drawer Móvil con animación suave de apertura/cierre */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 w-[280px] max-w-[85vw] bg-[#131b2e] shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {renderContent(true)}
        </div>
      </div>
    </>
  );
}
