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

  const userName = currentUser?.name || currentUser?.nombre || 'Moderador';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'MD';

  const userPhoto =
    currentUser?.urlImagenPerfil ||
    currentUser?.imagenPerfil ||
    currentUser?.fotoUrl ||
    currentUser?.foto ||
    currentUser?.imagenUrl ||
    null;

  return (
    <div className="panel-theme flex h-screen overflow-hidden bg-[#f4f6fa] font-body text-[#172033]">
      <Sidebar
        role="Moderador"
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="standard"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
        {/* Cabecera compartida del Moderador (Estática con acceso a perfil) */}
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
            userEmail={currentUser?.email || currentUser?.correo}
            userPhoto={userPhoto}
            onProfileClick={() => onSelect && onSelect('perfil')}
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>

        {/* Contenedor principal: única sección que realiza scroll */}
        <main className="mx-auto w-full max-w-[1400px] flex-1 overflow-y-auto min-h-0 px-4 sm:px-8 pb-10 pt-6 sm:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
