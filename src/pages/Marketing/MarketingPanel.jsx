import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiLayers, FiAward, FiImage, FiUser } from 'react-icons/fi';
import StandardLayout from '../../layouts/StandardLayout.jsx';
import MarketingPromocionesView from './MarketingPromocionesView.jsx';
import MarketingBannersView from './MarketingBannersView.jsx';
import MarketingPerfilView from './MarketingPerfilView.jsx';
import { session, extractPhotoUrl } from '../../services/session.js';
import { useDashboardTheme } from '../../hooks/useDashboardTheme.js';

const menuItems = [
  { id: 'eventos', label: 'Eventos Promocionados', icon: FiLayers },
  { id: 'planes', label: 'Planes de Promoción', icon: FiAward },
  { id: 'banners', label: 'Banners Publicitarios', icon: FiImage },
  { id: 'perfil', label: 'Mi Perfil', icon: FiUser },
];

export default function MarketingPanel() {
  useDashboardTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'eventos';
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

  const userPhoto = extractPhotoUrl(sessionUser) || null;

  const handleSelectTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'banners':
        return <MarketingBannersView />;

      case 'perfil':
        return <MarketingPerfilView onNavigateTab={handleSelectTab} />;

      case 'planes':
        return (
          <MarketingPromocionesView
            initialTab="planes"
            onNavigateTab={handleSelectTab}
          />
        );

      case 'eventos':
      case 'promociones':
      default:
        return (
          <MarketingPromocionesView
            initialTab="eventos"
            onNavigateTab={handleSelectTab}
          />
        );
    }
  };

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'banners':
        return 'BANNERS PUBLICITARIOS';
      case 'perfil':
        return 'MI PERFIL';
      case 'planes':
        return 'PLANES DE PROMOCIÓN';
      case 'eventos':
      case 'promociones':
      default:
        return 'EVENTOS PROMOCIONADOS';
    }
  };

  return (
    <StandardLayout
      role="Marketing"
      items={menuItems}
      activeItem={currentTab}
      onSelect={handleSelectTab}
      headerProps={{
        title: getHeaderTitle(),
        userName: userName,
        userInitials: userInitials,
        userPhoto: userPhoto,
        onProfileClick: () => handleSelectTab('perfil'),
      }}
      maxWidthClass="max-w-[1400px]"
    >
      {renderCurrentView()}
    </StandardLayout>
  );
}
