import React from 'react';
import EventDetailView from '../Organizador/EventDetailView.jsx';

/**
 * ModalDetalleEventoModeracion
 * Utiliza el drawer unificado EventDetailView (como en Organización) con acciones de moderación
 */
export default function ModalDetalleEventoModeracion({
  evento,
  isOpen,
  onClose,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
  actionLoading = false,
}) {
  if (!isOpen || !evento) return null;

  return (
    <EventDetailView
      eventId={evento?.id}
      event={evento}
      isDrawer={true}
      onBack={onClose}
      onClose={onClose}
      onAprobar={onAprobar}
      onSolicitarCorreccion={onSolicitarCorreccion}
      onRechazar={onRechazar}
      actionLoading={actionLoading}
    />
  );
}
