import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiCompass,
  FiExternalLink,
  FiMenu,
  FiX,
  FiZap,
} from 'react-icons/fi';
import AppLogo from '../common/AppLogo.jsx';

/**
 * OrganizationSidebar
 * Barra lateral especializada para el Centro de Operaciones de Eventos (Event Management Experience).
 * Ofrece diseño contemporáneo, claro, con identidad cultural y soporte para colapsar.
 */
export default function OrganizationSidebar({
  role = 'Organización',
  items = [],
  activeItem = 'resumen',
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
}) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('eventhive_org_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eventhive_org_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Agrupación lógica de navegación para experiencia editorial
  const sectionGroups = [
    {
      label: 'Experiencias',
      itemIds: ['resumen', 'eventos', 'entradas'],
    },
    {
      label: 'Producción & Ciudad',
      itemIds: ['operadores', 'posicionamiento'],
    },
    {
      label: 'Organización',
      itemIds: ['perfil'],
    },
  ];

  const renderContent = (isDrawer = false) => {
    const collapsed = isDrawer ? false : isCollapsed;

    return (
      <div className="flex h-full flex-col justify-between bg-white border-r border-slate-200/90 text-slate-800 select-none transition-all duration-300">
        {/* Cabecera del Centro de Operaciones */}
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <div
            className={`border-b border-slate-100 flex items-center transition-all ${
              collapsed
                ? 'flex-col gap-2 py-4 px-2'
                : 'justify-between py-4.5 px-4.5 sm:px-5'
            }`}
          >
            <Link
              to="/"
              className="group flex items-center gap-2.5 focus:outline-none"
              title="Ir al inicio de EventHive"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1.5 shadow-xs transition-transform group-hover:scale-105">
                <AppLogo showName={false} className="h-6 w-6 text-slate-950 shrink-0" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1 font-display text-sm font-black tracking-tight text-slate-900 leading-none">
                    <span>Event</span>
                    <span className="text-amber-600">Hive</span>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-widest text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ops Center
                  </span>
                </div>
              )}
            </Link>

            {isDrawer ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar navegación"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleCollapse}
                aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
                className="hidden md:flex p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
              </button>
            )}
          </div>

          {/* Badge de Rol y Estado de Producción */}
          {!collapsed && (
            <div className="mx-4 mt-3 mb-1 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/60 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 truncate">
                  {role}
                </p>
                <p className="text-[11px] font-medium text-slate-600 truncate">
                  Gestión de Producciones
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-2xs">
                PRO
              </span>
            </div>
          )}

          {/* Menú de Navegación */}
          <nav className="flex-1 px-3 py-3 space-y-4">
            {sectionGroups.map((group, groupIdx) => {
              const groupItems = items.filter((it) => group.itemIds.includes(it.id));
              if (groupItems.length === 0) return null;

              return (
                <div key={groupIdx} className="space-y-1">
                  {!collapsed && (
                    <p className="px-3 pt-1 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
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
                                  ? 'bg-[#0B1B3D] text-amber-400 font-bold shadow-sm ring-2 ring-amber-400/20'
                                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <Icon size={17} />
                              {count && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
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
                              ? 'bg-[#0B1B3D] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/90'
                          }`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-amber-400 text-slate-950 shadow-2xs'
                                  : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-900'
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
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 text-slate-600'
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
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          {collapsed ? (
            <Link
              to="/"
              title="Volver al portal público de EventHive"
              className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 transition-colors"
            >
              <FiArrowLeft size={16} />
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-100/80 text-slate-700 hover:text-slate-950 transition-all text-xs font-bold shadow-2xs group"
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
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      >
        <div
          className={`fixed top-0 bottom-0 left-0 w-[280px] max-w-[85vw] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
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

