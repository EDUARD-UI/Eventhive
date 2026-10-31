import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { session } from '../services/session.js';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

export default function AdminLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  searchTerm,
  onSearchChange,
  children,
}) {
  useDashboardTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sessionUser = session.getUser();
  const userName = sessionUser?.name || 'Administrador';
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'AD';
  const userPhoto =
    sessionUser?.urlImagenPerfil ||
    sessionUser?.imagenPerfil ||
    sessionUser?.fotoUrl ||
    sessionUser?.foto ||
    sessionUser?.imagenUrl ||
    null;

  return (
    <div className="admin-theme flex h-screen overflow-hidden bg-[#f1f5f9] font-body text-slate-800">
      <Sidebar
        role="Admin"
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="admin"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Cabecera compartida del Administrador (Estática) */}
        <div className="shrink-0 z-20">
          <Header
            title={title}
            showSearch={Boolean(onSearchChange)}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            searchPlaceholder="Buscar en el sistema..."
            userName={userName}
            userInitials={userInitials}
            userPhoto={userPhoto}
            onProfileClick={() => onSelect && onSelect('perfil')}
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>

        <main className="mx-auto w-full max-w-[1400px] min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-6 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
