import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import StandardDashboardSidebar from '../../components/common/StandardDashboardSidebar.jsx';
import Header from '../../components/Shared/Header.jsx';
import { Sparkles, Award, Image, User } from 'lucide-react';
import MarketingPromocionesView from './MarketingPromocionesView.jsx';
import MarketingBannersView from './MarketingBannersView.jsx';
import AdminPerfilView from '../Administrador/AdminPerfilView.jsx';
import { session } from '../../services/session.js';
import { useDashboardTheme } from '../../hooks/useDashboardTheme.js';
import HiveBeeLoader from '../../components/common/HiveBeeLoader.jsx';

const menuItems = [
  { id: 'eventos', label: 'Eventos Promocionados', icon: Sparkles },
  { id: 'planes', label: 'Planes de Promoción', icon: Award },
  { id: 'banners', label: 'Banners Publicitarios', icon: Image },
  { id: 'perfil', label: 'Mi Perfil', icon: User },
];

const marketingGroups = [
  {
    label: 'Campañas & Difusión',
    itemIds: ['eventos', 'planes', 'banners'],
  },
  {
    label: 'Cuenta',
    itemIds: ['perfil'],
  },
];

export default function MarketingPanel() {
  useDashboardTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'eventos';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState(() => session.getUser());

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

  const showToast = useCallback((message, type = 'success') => {
    Swal.fire({
      icon: type === 'error' ? 'error' : type === 'info' ? 'info' : 'success',
      title: type === 'error' ? 'Error' : 'Operación exitosa',
      text: typeof message === 'string' ? message : String(message),
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#087fea',
      timer: 2500,
    });
  }, []);

  const userName = sessionUser?.name || sessionUser?.nombre || 'Especialista Marketing';
  const userInitials = userName
    ? userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'MK';

  const userPhoto =
    sessionUser?.urlImagenPerfil ||
    sessionUser?.imagenPerfil ||
    sessionUser?.fotoUrl ||
    sessionUser?.foto ||
    sessionUser?.imagenUrl ||
    sessionUser?.avatar ||
    null;

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'banners':
        return <MarketingBannersView />;

      case 'perfil':
        return (
          <AdminPerfilView
            onNavigateTab={handleSelectTab}
            showToast={showToast}
          />
        );

      case 'planes':
        return <MarketingPromocionesView initialTab="planes" onNavigateTab={handleSelectTab} />;

      case 'eventos':
      case 'promociones':
      default:
        return <MarketingPromocionesView initialTab="eventos" onNavigateTab={handleSelectTab} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'banners':
        return 'Espacios Publicitarios y Banners';
      case 'perfil':
        return 'Mi Perfil de Marketing';
      case 'planes':
        return 'Planes de Promoción';
      case 'eventos':
      case 'promociones':
      default:
        return 'Eventos Promocionados';
    }
  };

  if (pageLoading) {
    return (
      <HiveBeeLoader
        text="Cargando..."
        subtext="Panel de Marketing"
        fullScreen={true}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#EEF2F6] font-body text-slate-800 antialiased">
      {/* Sidebar estandarizado azul oscuro (#0B1B3D) con favicon logo */}
      <StandardDashboardSidebar
        role="Marketing"
        items={menuItems}
        activeItem={currentTab}
        onSelect={handleSelectTab}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        groups={marketingGroups}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <div className="shrink-0 z-20">
          <Header
            title={getHeaderTitle()}
            userName={userName}
            userInitials={userInitials}
            userPhoto={userPhoto}
            userEmail={sessionUser?.email || sessionUser?.correo}
            onProfileClick={() => handleSelectTab('perfil')}
            onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>

        {/* Contenedor con scroll vertical pegado al borde derecho de la pantalla */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto">
          <main className="px-4 sm:px-8 pb-10 pt-5 sm:pt-7 max-w-[1400px] w-full mx-auto">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
}
