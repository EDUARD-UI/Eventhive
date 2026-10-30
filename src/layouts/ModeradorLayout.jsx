import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { session } from '../services/session.js';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

export default function ModeradorLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar en moderación...',
  children,
}) {
  useDashboardTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUser = session.getUser();

  const userName = currentUser?.name || 'Moderador';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'MD';

  return (
    <div className="moderador-theme flex h-screen overflow-hidden bg-[#f1f5f9] font-body text-slate-800">
      <Sidebar
        role="Moderador"
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="moderator"
        pageBg="#f1f5f9"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Cabecera compartida del Moderador (Estática) */}
        <div className="shrink-0 z-20">
          <Header
            title={title}
            subtitle={subtitle}
            showSearch={Boolean(onSearchChange)}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder={searchPlaceholder}
            userName={userName}
            userInitials={userInitials}
            userEmail={currentUser?.email}
            userPhoto={
              currentUser?.urlImagenPerfil ||
              currentUser?.imagenPerfil ||
              currentUser?.fotoUrl ||
              currentUser?.foto ||
              currentUser?.imagenUrl ||
              null
            }
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>

        {/* Contenedor principal: única sección que realiza scroll */}
        <main className="px-4 sm:px-8 pb-12 flex-1 pt-6 max-w-[1400px] w-full mx-auto overflow-y-auto min-h-0 animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
