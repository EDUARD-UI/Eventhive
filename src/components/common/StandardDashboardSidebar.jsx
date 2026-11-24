import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiX,
} from 'react-icons/fi';

/**
 * StandardDashboardSidebar
 * Barra lateral estandarizada para todos los centros de control de EventHive:
 * Organización, Moderador, Marketing y Administración.
 * 
 * - Fondo azul oscuro de la app (#0B1B3D).
 * - Logo favicon oficial de EventHive (/LOGO45x50.png).
 * - Nombre de marca limpio "EventHive" sin etiquetas redundantes como "Ops Center".
 * - Altura de cabecera fija (h-[72px]) para evitar brincos o desplazamientos verticales al expandir/colapsar.
 * - Sin recuadro "PRO".
 * - Alto contraste, estado activo en ámbar vibrante, soporte colapsable y drawer móvil.
 */
export default function StandardDashboardSidebar({
  role = 'Panel',
  items = [],
  activeItem = 'resumen',
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
  groups = null, // Opcional: [{ label: 'Sección', itemIds: ['id1', 'id2'] }]
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(`eventhive_sidebar_${role.toLowerCase()}_collapsed`) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`eventhive_sidebar_${role.toLowerCase()}_collapsed`, String(next));
      } catch {}
      return next;
    });
  };

  // Si no se proveen grupos explícitos, se agrupan en una lista única
  const defaultGroups = groups || [
    {
      label: null,
      itemIds: items.map((it) => it.id),
    },
  ];

  const renderContent = (isDrawer = false) => {
    const collapsed = isDrawer ? false : isCollapsed;

    return (
      <div className="flex h-full flex-col justify-between bg-[#0F2342] text-slate-100 select-none border-r border-white/[0.08] transition-all duration-300">
        {/* Cabecera Superior del Sidebar con altura fija continua h-[72px] */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div
            className={`h-[72px] shrink-0 border-b border-white/[0.08] flex items-center transition-all ${
              collapsed
                ? 'justify-between px-2.5'
                : 'justify-between px-4 sm:px-5'
            }`}
          >
            {collapsed ? (
              <div className="w-full flex items-center justify-between gap-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-white/10 border border-white/15 p-1 shadow-xs">
                  <img
                    src="/LOGO45x50.png"
                    alt="EventHive"
                    className="h-7 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '/LOGO32x32.png';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleCollapse}
                  aria-label="Expandir barra lateral"
                  title="Expandir barra lateral"
                  className="flex p-1.5 rounded-[2px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* Isotipo y nombre institucional (No redirige al home; el portal público está en el pie) */}
                <div className="flex items-center gap-3 min-w-0 select-none">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] bg-white/10 border border-white/15 p-1 shadow-xs">
                    <img
                      src="/LOGO45x50.png"
                      alt="EventHive Favicon Logo"
                      className="h-7 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.src = '/LOGO32x32.png';
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1 font-display text-base font-black tracking-tight text-white leading-none">
                    <span>Event</span>
                    <span className="text-[#F5B800]">Hive</span>
                  </div>
                </div>

                {isDrawer ? (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar navegación"
                    className="p-1.5 rounded-[2px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-auto"
                  >
                    <FiX size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    aria-label="Colapsar barra lateral"
                    title="Colapsar barra lateral"
                    className="hidden md:flex p-1.5 rounded-[2px] text-slate-400 hover:text-[#F5B800] hover:bg-white/10 transition-colors cursor-pointer ml-auto"
                  >
                    <FiChevronLeft size={16} />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Menú de Navegación Editorial con Barra Láser de 3px en #F5B800 */}
          <nav className="flex-1 px-0 py-3 space-y-4">
            {defaultGroups.map((group, groupIdx) => {
              const groupItems = items.filter((it) => group.itemIds.includes(it.id));
              if (groupItems.length === 0) return null;

              return (
                <div key={groupIdx} className="space-y-1">
                  {!collapsed && group.label && (
                    <p className="px-4 pt-1 pb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-0.5">
                    {groupItems.map(({ id, label, icon: Icon, count }) => {
                      const isActive = activeItem === id;

                      if (collapsed) {
                        return (
                          <div key={id} className="relative flex justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                onSelect(id);
                                onClose();
                              }}
                              title={label}
                              aria-label={label}
                              className={`relative flex h-10 w-full items-center justify-center transition-all cursor-pointer ${
                                isActive
                                  ? 'text-white'
                                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                              style={{
                                background: isActive
                                  ? 'linear-gradient(90deg, rgba(245,184,0,0.12) 0%, transparent 100%)'
                                  : 'transparent',
                              }}
                            >
                              {isActive && (
                                <span
                                  className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5B800] shadow-[0_0_8px_rgba(245,184,0,0.6)]"
                                  aria-hidden="true"
                                />
                              )}
                              <Icon
                                size={17}
                                className={`transition-colors ${
                                  isActive ? 'text-[#F5B800]' : 'text-slate-400'
                                }`}
                              />
                              {count && (
                                <span className="absolute top-1 right-2 flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-[2px] bg-[#F5B800] text-[#0F2342] text-[8px] font-mono font-black">
                                  {count}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => {
                            onSelect(id);
                            onClose();
                          }}
                          className={`group relative flex w-full items-center justify-between py-2.5 px-4 transition-all cursor-pointer font-mono text-xs uppercase tracking-wider text-left ${
                            isActive
                              ? 'text-white font-semibold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                          style={{
                            background: isActive
                              ? 'linear-gradient(90deg, rgba(245,184,0,0.12) 0%, transparent 100%)'
                              : 'transparent',
                          }}
                        >
                          {isActive && (
                            <span
                              className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5B800] shadow-[0_0_8px_rgba(245,184,0,0.6)]"
                              aria-hidden="true"
                            />
                          )}

                          <span className="flex items-center gap-3 min-w-0">
                            <Icon
                              size={16}
                              strokeWidth={1.75}
                              className={`shrink-0 transition-colors ${
                                isActive
                                  ? 'text-[#F5B800]'
                                  : 'text-slate-400 group-hover:text-slate-200'
                              }`}
                            />
                            <span className="truncate">{label}</span>
                          </span>

                          {count && (
                            <span
                              className={`font-mono text-xs tracking-wider transition-colors shrink-0 ${
                                isActive ? 'text-[#F5B800] font-bold' : 'text-slate-400'
                              }`}
                            >
                              {String(count).padStart(2, '0')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar: Salida a Portal Público */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0A1830]">
          {collapsed ? (
            <Link
              to="/"
              title="Volver al portal público de EventHive"
              className="flex h-9 w-9 mx-auto items-center justify-center rounded-[2px] text-slate-400 hover:text-[#F5B800] hover:bg-white/10 transition-colors"
            >
              <FiArrowLeft size={16} />
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-[2px] border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all font-mono text-xs uppercase tracking-wider group"
            >
              <span className="flex items-center gap-2 truncate">
                <FiArrowLeft size={13} className="text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Portal Público</span>
              </span>
              <FiExternalLink size={12} className="text-slate-400 shrink-0 group-hover:text-[#F5B800]" />
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex h-screen sticky top-0 shrink-0 flex-col z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Drawer Móvil */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 w-[280px] max-w-[85vw] bg-[#0B1B3D] shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
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
