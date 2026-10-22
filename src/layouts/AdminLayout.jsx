import React, { useState } from 'react';
import Sidebar from '../components/Shared/Sidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { session } from '../services/session.js';

export default function AdminLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  searchTerm,
  onSearchChange,
  children,
}) {
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
    <div className="admin-theme flex min-h-screen bg-[#f1f5f9] font-body text-slate-800">
      <Sidebar
        role="Admin"
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        variant="admin"
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
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

        {/* El contenido crece con la página y usa el scroll del navegador */}
        <main className="px-4 sm:px-8 pb-10 flex-1 pt-6 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
