import React, { useState } from 'react';
import OrganizationSidebar from '../components/componentsOrganizador/OrganizationSidebar.jsx';
import OrganizationHeader from '../components/componentsOrganizador/OrganizationHeader.jsx';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

/**
 * StandardLayout
 * Layout principal del Centro de Operaciones de EventHive (Event Management Experience).
 * Tema claro exclusivo, paleta equilibrada, estructura fluida y responsive.
 */
export default function StandardLayout({
  role = 'Organización',
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] font-body text-slate-800 antialiased">
      {/* Barra lateral especializada para la organización */}
      <OrganizationSidebar
        role={role}
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Contenedor principal con scroll vertical suave */}
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

        {/* Lienzo de contenido scrolleable */}
        <main
          className={`mx-auto w-full ${maxWidthClass} flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 pb-12 pt-5 sm:pt-7`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
