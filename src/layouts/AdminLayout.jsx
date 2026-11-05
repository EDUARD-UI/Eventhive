import React, { useState, useEffect } from 'react';
import StandardDashboardSidebar from '../components/common/StandardDashboardSidebar.jsx';
import Header from '../components/Shared/Header.jsx';
import { session } from '../services/session.js';
import { useDashboardTheme } from '../hooks/useDashboardTheme.js';

export default function AdminLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  subtitle,
  searchTerm,
  onSearchChange,
  children,
}) {
  useDashboardTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => session.getUser());

  // Escuchar actualizaciones de sesión en tiempo real (foto de perfil, nombre, etc.)
  useEffect(() => {
    const handleSessionUpdated = (e) => {
      const updated = e?.detail || session.getUser();
      setSessionUser(updated ? { ...updated } : null);
    };

    window.addEventListener('eventhive_session_updated', handleSessionUpdated);
    window.addEventListener('storage', handleSessionUpdated);
    return () => {
      window.removeEventListener('eventhive_session_updated', handleSessionUpdated);
      window.removeEventListener('storage', handleSessionUpdated);
    };
  }, []);

  const userName = sessionUser?.name || sessionUser?.nombre || 'Administrador';
  const userInitials = userName ? userName.substring(0, 2).toUpperCase() : 'AD';
  const userPhoto =
    sessionUser?.urlImagenPerfil ||
    sessionUser?.imagenPerfil ||
    sessionUser?.fotoUrl ||
    sessionUser?.foto ||
    sessionUser?.imagenUrl ||
    sessionUser?.avatar ||
    null;

  const adminGroups = [
    {
      label: 'Gestión & Verificación',
      itemIds: ['resumen', 'organizaciones', 'solicitudes', 'sugerencias-ascenso'],
    },
    {
      label: 'Operaciones',
      itemIds: ['trabajadores', 'reportes', 'usuarios', 'categorias'],
    },
    {
      label: 'Cuenta',
      itemIds: ['perfil'],
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF2F6] font-body text-slate-800 antialiased">
      {/* Sidebar estandarizado azul oscuro (#0B1B3D) con favicon logo */}
      <StandardDashboardSidebar
        role="Admin"
        items={menuItems}
        activeItem={activeItem}
        onSelect={onSelect}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        groups={adminGroups}
      />

      <div className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Cabecera compartida del Administrador */}
        <div className="shrink-0 z-20">
          <Header
            title={title}
            subtitle={subtitle}
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

        {/* Contenedor con scroll vertical pegado al borde derecho de la pantalla */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto">
          <main className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-5 sm:pt-7 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
