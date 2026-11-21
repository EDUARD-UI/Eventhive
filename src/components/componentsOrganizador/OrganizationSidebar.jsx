import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiX } from 'react-icons/fi';

/**
 * OrganizationSidebar — Editorial
 * Sidebar arquitectónico de 240px fijo, fondo Azul Marino Institucional (#0F2342).
 * Sin botones de fondo redondeado, íconos lineales 1.5px y barra láser ámbar (#F5B800).
 */
export default function OrganizationSidebar({
  items = [],
  activeItem = 'resumen',
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
}) {
  const content = (
    <div className="flex h-full w-[240px] flex-col justify-between bg-[#0F2342] text-slate-100 select-none border-r border-white/[0.08]">
      {/* Zona Superior: Identidad de Marca */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="py-7 px-6 border-b border-white/[0.08] flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 focus:outline-none group"
            title="EventHive"
          >
            {/* Isotipo sin fondo amarillo */}
            <img
              src="/LOGO45x50.png"
              alt="EventHive"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = '/LOGO32x32.png';
              }}
            />
            {/* Nombre con Event blanco y Hive dorado ámbar, sin nada abajo */}
            <span className="font-display font-black text-lg tracking-wider uppercase leading-none">
              <span className="text-white">Event</span>
              <span className="text-[#F5B800]">Hive</span>
            </span>
          </Link>

          {/* Botón de cierre en móviles */}
          {isOpen && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar navegación"
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <FiX size={18} />
            </button>
          )}
        </div>

        {/* Lista de Navegación Editorial */}
        <nav className="flex-1 px-0 py-6 space-y-1 overflow-y-auto no-scrollbar">
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
                className={`group relative flex w-full items-center gap-3.5 py-3.5 px-6 text-left font-mono text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer ${
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
                {IconComponent && (
                  <IconComponent
                    size={17}
                    strokeWidth={1.5}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[#F5B800]' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                )}

                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pie del Sidebar: Enlace minimalista Portal Público */}
      <div className="p-5 border-t border-white/[0.08]">
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
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fijo en escritorio */}
      <aside className="hidden md:flex shrink-0 w-[240px] h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Drawer móvil con overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
}
