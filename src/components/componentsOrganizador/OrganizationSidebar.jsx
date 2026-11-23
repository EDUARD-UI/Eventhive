import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiX } from 'react-icons/fi';

/**
 * OrganizationSidebar — Editorial
 * Sidebar arquitectónico con modo extendido (240px) y modo colapsado/rail (64px) en escritorio.
 * En modo colapsado, muestra los isotipos/íconos de cada actividad con tooltips nativos y botón de expansión.
 * Fondo Azul Marino Institucional (#0F2342) con barra láser vertical (#F5B800) en el elemento activo.
 * Soporta modo Drawer Off-Canvas (< 1024px) y colapso/expansión fluido en escritorio (>= 1024px).
 */
export default function OrganizationSidebar({
  items = [],
  activeItem = 'resumen',
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
  desktopOpen = true,
  onToggleDesktop = () => {},
}) {
  const renderSidebarContent = (isCollapsed = false) => (
    <div
      className={`flex h-full flex-col justify-between bg-[#0F2342] text-slate-100 select-none border-r border-white/[0.08] transition-all duration-300 ${
        isCollapsed ? 'w-[64px]' : 'w-[240px]'
      }`}
    >
      {/* Zona Superior: Identidad de Marca / Isotipo de actividad */}
      <div className="flex flex-col flex-1 min-h-0">
        <div
          className={`h-[56px] lg:h-[64px] border-b border-white/[0.08] flex items-center shrink-0 ${
            isCollapsed ? 'justify-center px-1' : 'justify-between px-4'
          }`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1">
              {/* Botón superior con flecha / isotipo para expandir */}
              <button
                type="button"
                onClick={onToggleDesktop}
                aria-label="Expandir barra lateral"
                title="Expandir barra lateral"
                className="flex items-center justify-center gap-1 p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
              >
                <img
                  src="/LOGO45x50.png"
                  alt="EventHive"
                  className="h-6 w-auto object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = '/LOGO32x32.png';
                  }}
                />
                <FiChevronRight size={13} className="text-[#F5B800] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <Link
                  to="/"
                  className="flex items-center gap-2 focus:outline-none group shrink-0"
                  title="EventHive"
                >
                  {/* Isotipo */}
                  <img
                    src="/LOGO45x50.png"
                    alt="EventHive"
                    className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = '/LOGO32x32.png';
                    }}
                  />
                  {/* Nombre con Event blanco y Hive dorado ámbar */}
                  <span className="font-display font-black text-base lg:text-lg tracking-wider uppercase leading-none">
                    <span className="text-white">Event</span>
                    <span className="text-[#F5B800]">Hive</span>
                  </span>
                </Link>

                {/* Flecha superior para colapsar junto a EventHive */}
                <button
                  type="button"
                  onClick={onToggleDesktop}
                  aria-label="Colapsar barra lateral"
                  title="Colapsar barra lateral"
                  className="hidden lg:flex text-slate-400 hover:text-[#F5B800] p-1.5 rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
                >
                  <FiChevronLeft size={16} />
                </button>
              </div>

              {/* Botón de cierre en móviles/tablet (< 1024px) */}
              {isOpen && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar navegación"
                  className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-[2px] transition-colors cursor-pointer"
                >
                  <FiX size={18} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Lista de Navegación Editorial */}
        <nav className="flex-1 px-0 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelect(item.id);
                  if (isOpen) onClose();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex w-full items-center transition-all duration-150 cursor-pointer ${
                  isCollapsed
                    ? 'justify-center py-3.5 px-0'
                    : 'gap-3.5 py-3.5 px-6 text-left font-mono text-xs uppercase tracking-wider'
                } ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(245,184,0,0.12) 0%, transparent 100%)'
                    : 'transparent',
                }}
              >
                {/* Barra vertical tipo láser de 3px pegada al borde izquierdo */}
                {isActive && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#F5B800] shadow-[0_0_8px_rgba(245,184,0,0.6)]"
                    aria-hidden="true"
                  />
                )}

                {/* Ícono lineal con 1.5px de grosor */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5 min-w-0'}`}>
                  {IconComponent && (
                    <IconComponent
                      size={18}
                      strokeWidth={1.5}
                      className={`shrink-0 transition-colors ${
                        isActive ? 'text-[#F5B800]' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                  )}
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.count !== null && item.count !== undefined && (
                  <span
                    className={`font-mono text-xs tracking-wider transition-colors shrink-0 ${
                      isActive ? 'text-[#F5B800] font-bold' : 'text-slate-400'
                    }`}
                  >
                    {String(item.count).padStart(2, '0')}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar */}
      <div className={`border-t border-white/[0.08] ${isCollapsed ? 'p-3 flex justify-center' : 'p-5'}`}>
        {!isCollapsed && (
          <Link
            to="/"
            className="group flex items-center justify-between w-full font-mono text-[11px] uppercase tracking-wider text-slate-400 hover:text-[#F5B800] transition-colors py-2 px-1"
          >
            <span className="flex items-center gap-1.5">
              <span>↗</span>
              <span>Portal Público</span>
            </span>
            <FiExternalLink size={12} className="opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar de escritorio: pasa fluidamente entre 240px y 64px (Rail de isotipos) */}
      <aside
        className={`hidden lg:flex shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          desktopOpen ? 'w-[240px]' : 'w-[64px]'
        }`}
      >
        {renderSidebarContent(!desktopOpen)}
      </aside>

      {/* Menú Desplegable (Off-Canvas Drawer) en móvil y tablet (< 1024px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 transition-opacity cursor-pointer"
            style={{
              backgroundColor: 'rgba(15, 35, 66, 0.72)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full animate-in slide-in-from-left duration-250 shadow-2xl">
            {renderSidebarContent(false)}
          </div>
        </div>
      )}
    </>
  );
}
