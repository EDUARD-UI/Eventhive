import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

export default function StandardLayout({
  role = 'Organización',
  menuItems = [],
  activeItem,
  onSelect,
  headerProps = {},
  customHeader = null,
  children,
  maxWidthClass = 'max-w-[1280px]',
}) {
  useDashboardTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f6fa] font-body text-[#172033]">
      <Sidebar
        role={role}
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="standard"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Barra superior de navegación estática */}
        <div className="shrink-0 z-20">
          {customHeader ? (
            customHeader
          ) : (
            <Header
              {...headerProps}
              onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
            />
          )}
        </div>

        {/* Sección principal de datos: única que realiza scroll */}
        <main className={`mx-auto w-full ${maxWidthClass} flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 pb-10 pt-6 sm:pt-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
