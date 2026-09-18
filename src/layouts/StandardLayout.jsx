import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';

export default function StandardLayout({
  role = 'Organizador',
  menuItems = [],
  activeItem,
  onSelect,
  headerProps = {},
  customHeader = null,
  children,
  maxWidthClass = 'max-w-[1280px]',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4f6fa] font-body text-[#172033]">
      <Sidebar
        role={role}
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="standard"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-y-auto">
        {customHeader ? (
          customHeader
        ) : (
          <Header
            {...headerProps}
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        )}

        <main className={`mx-auto w-full ${maxWidthClass} flex-1 px-4 sm:px-8 pb-10 pt-6 sm:pt-8`}>
          {children}
        </main>
      </div>
    </div>
  );
}
