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
 * Barra lateral estandarizada para los centros de control de EventHive:
 * Organización, Moderador y Marketing.
 * 
 * - Fondo azul oscuro de la app (#0B1B3D).
 * - Logo favicon oficial de EventHive (/LOGO45x50.png).
 * - Sin recuadro "PRO" (eliminado según directriz).
 * - Alto contraste, estado activo en ámbar vibrante de la marca, soporte colapsable y drawer móvil.
 */
export default function StandardDashboardSidebar({
  role = 'Organización',
  roleSubtitle = 'Control Center',
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
      <div className="flex h-full flex-col justify-between bg-[#0B1B3D] text-slate-100 select-none border-r border-slate-800/80 transition-all duration-300">
        {/* Cabecera Superior del Sidebar */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div
            className={`border-b border-white/10 flex items-center transition-all ${
              collapsed
                ? 'flex-col gap-3 py-4 px-2'
                : 'justify-between py-4.5 px-4.5 sm:px-5'
            }`}
          >
            <Link
              to="/"
              className="group flex items-center gap-3 focus:outline-none min-w-0"
              title="Ir al inicio de EventHive"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 p-1 transition-transform group-hover:scale-105 shadow-xs">
                <img
                  src="/LOGO45x50.png"
                  alt="EventHive Favicon Logo"
                  className="h-7 w-auto object-contain"
                  onError={(e) => {
                    // Fallback a LOGO32x32 si fuera necesario
                    e.currentTarget.src = '/LOGO32x32.png';
                  }}
                />
              </div>

              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 font-display text-sm font-black tracking-tight text-white leading-none">
                    <span>Event</span>
                    <span className="text-amber-400">Hive</span>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{roleSubtitle || role}</span>
                  </span>
                </div>
              )}
            </Link>

            {isDrawer ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar navegación"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiX size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
              </button>
            )}
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 px-3 py-4 space-y-4">
            {defaultGroups.map((group, groupIdx) => {
              const groupItems = items.filter((it) => group.itemIds.includes(it.id));
              if (groupItems.length === 0) return null;

              return (
                <div key={groupIdx} className="space-y-1">
                  {!collapsed && group.label && (
                    <p className="px-3 pt-1 pb-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      {group.label}
                    </p>
                  )}
                  <div className="space-y-1">
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
                              className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20 ring-2 ring-amber-300'
                                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              <Icon size={17} />
                              {count && (
                                <span
                                  className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black ${
                                    isActive
                                      ? 'bg-slate-950 text-amber-400'
                                      : 'bg-amber-400 text-slate-950'
                                  }`}
                                >
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
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-slate-950 text-amber-400'
                                  : 'bg-white/10 text-slate-300 group-hover:text-white group-hover:bg-white/15'
                              }`}
                            >
                              <Icon size={14} />
                            </span>
                            <span className="truncate">{label}</span>
                          </span>

                          {count && (
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-slate-950 text-amber-400'
                                  : 'bg-white/15 text-white'
                              }`}
                            >
                              {count}
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
        <div className="p-3 border-t border-white/10 bg-slate-950/30">
          {collapsed ? (
            <Link
              to="/"
              title="Volver al portal público de EventHive"
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
            >
              <FiArrowLeft size={16} />
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white transition-all text-xs font-bold shadow-2xs group"
            >
              <span className="flex items-center gap-2 truncate">
                <FiArrowLeft size={13} className="text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
                <span>Portal Público</span>
              </span>
              <FiExternalLink size={12} className="text-slate-400 shrink-0" />
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

