import React from 'react';
import StandardLayout from './StandardLayout.jsx';

export default function ModeradorLayout({
  menuItems = [],
  activeItem,
  onSelect,
  title,
  subtitle,
  children,
}) {
  return (
    <StandardLayout
      role="Moderador"
      items={menuItems}
      activeItem={activeItem}
      onSelect={onSelect}
      headerProps={{
        title,
        subtitle,
        onProfileClick: () => onSelect && onSelect('perfil'),
      }}
      maxWidthClass="max-w-[1400px]"
    >
      {children}
    </StandardLayout>
  );
}
