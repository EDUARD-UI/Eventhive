import React from 'react';
import StandardDashboardSidebar from '../common/StandardDashboardSidebar.jsx';

/**
 * OrganizationSidebar
 * Barra lateral estandarizada para el Centro de Operaciones de Eventos (Organización).
 * Fondo azul oscuro de la app (#0B1B3D), logo favicon oficial (/LOGO45x50.png) y sin recuadro PRO.
 */
export default function OrganizationSidebar({
  role = 'Organización',
  items = [],
  activeItem = 'resumen',
  onSelect = () => {},
  isOpen = false,
  onClose = () => {},
}) {
  // Agrupación editorial de navegación
  const orgGroups = [
    {
      label: 'Experiencias',
      itemIds: ['resumen', 'eventos', 'entradas'],
    },
    {
      label: 'Producción & Ciudad',
      itemIds: ['operadores', 'posicionamiento'],
    },
    {
      label: 'Organización',
      itemIds: ['perfil'],
    },
  ];

  return (
    <StandardDashboardSidebar
      role={role}
      roleSubtitle="Ops Center"
      items={items}
      activeItem={activeItem}
      onSelect={onSelect}
      isOpen={isOpen}
      onClose={onClose}
      groups={orgGroups}
    />
  );
}
