import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { session } from '../services/session.js';

export default function ModeradorLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  subtitle,
  badgeText = 'Módulo de Moderación',
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Buscar en moderación...',
  children,
}) {
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
    <div className="moderador-theme flex min-h-screen bg-[#f1f5f9] font-body text-slate-800">
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

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Cabecera compartida del Moderador */}
        <Header
          title={title}
          subtitle={subtitle}
          badgeText={badgeText}
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

        {/* Contenedor principal con fondo gris claro y tarjetas nítidas */}
        <main className="px-4 sm:px-8 pb-12 flex-1 pt-6 max-w-[1400px] w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
