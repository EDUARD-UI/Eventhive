import React, { useState } from 'react';
import OrganizationSidebar from '../components/componentsOrganizador/OrganizationSidebar.jsx';
import OrganizationHeader from '../components/componentsOrganizador/OrganizationHeader.jsx';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

/**
 * StandardLayout
 * Layout principal del Centro de Operaciones de EventHive (Event Management Experience).
 * - Tema claro exclusivo, fondo neutro con alto contraste (#EEF2F6).
 * - Barra de scroll vertical pegada al borde derecho de la pantalla en todo momento.
 */
export default function StandardLayout({
  role = 'Organización',
  items = [],
  menuItems = [],
  activeItem,
  onSelect,
  headerProps = {},
  customHeader = null,
  children,
  maxWidthClass = 'max-w-[1360px]',
}) {
  useDashboardTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const actualItems = items.length > 0 ? items : menuItems;

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF2F6] font-body text-slate-800 antialiased">
      {/* Barra lateral especializada para la organización */}
      <OrganizationSidebar
        role={role}
        items={actualItems}
        activeItem={activeItem}
        onSelect={onSelect}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Contenedor principal */}
      <div className="relative flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Barra superior de navegación */}
        <div className="shrink-0 z-20">
          {customHeader ? (
            customHeader
          ) : (
            <OrganizationHeader
              {...headerProps}
              onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
            />
          )}
        </div>

        {/* Contenedor con scroll vertical pegado al borde derecho de la pantalla */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto">
          <main
            className={`mx-auto w-full ${maxWidthClass} px-4 sm:px-8 pb-12 pt-5 sm:pt-7`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
