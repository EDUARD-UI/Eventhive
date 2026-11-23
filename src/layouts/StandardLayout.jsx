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
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('eventhive_desktop_sidebar_open') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleDesktopSidebar = () => {
    setDesktopSidebarOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eventhive_desktop_sidebar_open', String(next));
      } catch {}
      return next;
    });
  };

  const actualItems = items.length > 0 ? items : menuItems;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FA] font-body text-slate-800 antialiased">
      {/* Barra lateral especializada para la organización / moderador / marketing */}
      <OrganizationSidebar
        role={role}
        items={actualItems}
        activeItem={activeItem}
        onSelect={onSelect}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        desktopOpen={desktopSidebarOpen}
        onToggleDesktop={toggleDesktopSidebar}
      />

      {/* Contenedor principal */}
      <div className="relative flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Barra superior de navegación (height: 56px móvil / 64px escritorio) */}
        <div className="shrink-0 z-20">
          {customHeader ? (
            customHeader
          ) : (
            <OrganizationHeader
              userRole={role}
              {...headerProps}
              onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
              desktopSidebarOpen={desktopSidebarOpen}
              onToggleDesktopSidebar={toggleDesktopSidebar}
            />
          )}
        </div>

        {/* Contenedor con scroll vertical pegado al borde derecho de la pantalla y cero overflow horizontal */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <main
            className={`mx-auto w-full ${maxWidthClass} px-4 sm:px-6 lg:px-10 pb-12 pt-4 sm:pt-6 lg:pt-8 animate-stage-entry overflow-x-hidden`}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
