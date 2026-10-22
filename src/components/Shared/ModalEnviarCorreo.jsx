import React from 'react';
import GmailComposeModal from './GmailComposeModal.jsx';

/**
 * ModalEnviarCorreo
 * Adaptador retrocompatible que utiliza el compositor flotante estilo Gmail.
 * Soporta envío de correos directos e invitaciones institucionales con roles autorizados.
 */
export default function ModalEnviarCorreo({
  isOpen,
  onClose,
  initialEmail = '',
  initialName = '',
  defaultSubject = '',
  defaultRole = 'MODERADOR',
  initialMode = 'email',
  onSendSuccess,
}) {
  return (
    <GmailComposeModal
      isOpen={isOpen}
      onClose={onClose}
      initialEmail={initialEmail}
      initialName={initialName}
      defaultSubject={defaultSubject}
      defaultRole={defaultRole}
      initialMode={initialMode}
      onSuccess={onSendSuccess}
    />
  );
}
