import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiMinus,
  FiMaximize2,
  FiMinimize2,
  FiTrash2,
  FiPaperclip,
  FiLink2,
  FiSmile,
  FiImage,
  FiLock,
  FiEdit2,
  FiMoreVertical,
  FiChevronDown,
  FiShield,
  FiInfo,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { session, normalizeRole } from '../../services/session.js';
import adminService from '../../features/admin/services/adminService.js';
import { organizerService } from '../../services/organizerService.js';
import { showSuccessAlert, showErrorAlert, showConfirmAlert } from '../../utils/alertUtils.js';

/**
 * GmailComposeModal
 * Réplica fiel del compositor de correo de Gmail según la interfaz oficial.
 * Admite redacción de mensajes directos e invitaciones de rol institucionales.
 */
export default function GmailComposeModal({
  isOpen,
  onClose,
  initialEmail = '',
  initialName = '',
  defaultSubject = '',
  defaultRole = 'MODERADOR',
  initialMode = 'email', // 'email' | 'invite'
  onSuccess,
}) {
  const user = session.getUser();
  const rawRole = user?.role || user?.rolNombre || user?.rol;
  const userRole = normalizeRole(rawRole);

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isRepresentante = userRole === 'REPRESENTANTE';
  const canInvite = isAdmin || isRepresentante;

  // Estados de ventana
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Estados de redacción
  const [mode, setMode] = useState(initialMode === 'invite' && canInvite ? 'invite' : 'email');
  const [destinatario, setDestinatario] = useState(initialEmail || '');
  const [recipientName, setRecipientName] = useState(initialName || '');
  const [showCc, setShowCc] = useState(false);
  const [showCco, setShowCco] = useState(false);
  const [cc, setCc] = useState('');
  const [cco, setCco] = useState('');
  const [rol, setRol] = useState(
    isRepresentante ? 'OPERADOR' : defaultRole === 'MARKETING' ? 'MARKETING' : 'MODERADOR'
  );
  const [asunto, setAsunto] = useState(defaultSubject || '');
  const [mensaje, setMensaje] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);

  const containerRef = useRef(null);
  const recipientInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
      setIsMaximized(false);
      setDestinatario(initialEmail || '');
      setRecipientName(initialName || '');
      setAsunto(defaultSubject || '');
      setMensaje('');
      setShowCc(false);
      setShowCco(false);
      setCc('');
      setCco('');
      setShowScheduleMenu(false);
      setMode(initialMode === 'invite' && canInvite ? 'invite' : 'email');
      setRol(isRepresentante ? 'OPERADOR' : defaultRole === 'MARKETING' ? 'MARKETING' : 'MODERADOR');

      setTimeout(() => {
        recipientInputRef.current?.focus();
      }, 120);
    }
  }, [isOpen, initialEmail, initialName, defaultSubject, defaultRole, initialMode, canInvite, isRepresentante]);

  // Si cambia a modo invitación y el asunto está vacío, prellenar uno institucional
  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'invite' && (!asunto.trim() || asunto.trim() === 'Mensaje nuevo')) {
      const rolTexto = isAdmin ? (rol === 'MARKETING' ? 'Marketing' : 'Moderador') : 'Operador';
      setAsunto(`Invitación para unirte al equipo de EventHive como ${rolTexto}`);
    }
  };

  const hasContent = Boolean(destinatario.trim() || asunto.trim() || mensaje.trim());

  const handleAttemptClose = async () => {
    if (hasContent) {
      const isConfirmed = await showConfirmAlert({
        title: '¿Descartar borrador?',
        text: 'Hay datos redactados en este mensaje. Si cierras la ventana se perderán los cambios.',
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        icon: 'warning',
      });
      if (!isConfirmed) return;
    }
    onClose();
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();

    const emailTrim = destinatario.trim();
    const asuntoTrim = asunto.trim();
    const mensajeTrim = mensaje.trim();

    if (!emailTrim) {
      await showErrorAlert({
        title: 'Destinatario requerido',
        text: 'Debes especificar una dirección de correo para el destinatario.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      await showErrorAlert({
        title: 'Correo no válido',
        text: 'El formato de correo electrónico ingresado no es válido.',
      });
      return;
    }

    if (mode === 'email') {
      if (!asuntoTrim) {
        await showErrorAlert({
          title: 'Asunto obligatorio',
          text: 'Debes incluir un asunto en el correo para poder enviarlo.',
        });
        return;
      }
      if (!mensajeTrim) {
        await showErrorAlert({
          title: 'Mensaje vacío',
          text: 'Debes redactar un mensaje en el cuerpo del correo antes de enviar.',
        });
        return;
      }
    }

    setIsSending(true);

    try {
      if (mode === 'invite') {
        if (isAdmin) {
          await adminService.invitarRol({ correo: emailTrim, rol });
          await showSuccessAlert({
            title: 'Invitación oficial enviada',
            text: `Se ha despachado la invitación a ${emailTrim} para el rol de ${rol}.`,
            badge: 'Invitación Exitosa',
          });
        } else if (isRepresentante) {
          await organizerService.invitarOperador(emailTrim);
          await showSuccessAlert({
            title: 'Invitación oficial enviada',
            text: `Se ha enviado la invitación a ${emailTrim} para vincularse como Operador de tu organización.`,
            badge: 'Operador Vinculado',
          });
        }
      } else {
        await adminService.enviarCorreoAdmin({
          destinatario: emailTrim,
          asunto: asuntoTrim,
          mensaje: mensajeTrim,
        });
        await showSuccessAlert({
          title: 'Correo enviado',
          text: `Mensaje enviado satisfactoriamente a ${emailTrim}.`,
          badge: 'Gmail API',
        });
      }

      if (onSuccess) {
        onSuccess({
          mode,
          email: emailTrim,
          rol: mode === 'invite' ? rol : null,
          asunto: asuntoTrim,
        });
      }

      onClose();
    } catch (err) {
      await showErrorAlert({
        title: 'Error al enviar correo',
        text: err?.message || err?.response?.data?.message || 'No fue posible completar el envío del correo.',
        badge: 'Envío Fallido',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  // 1. RENDER MINIMIZADO (Pestaña compacta estilo Gmail)
  if (isMinimized) {
    return createPortal(
      <div
        className="fixed bottom-0 right-4 sm:right-8 z-[9999] bg-[#f2f6fc] text-[#1f1f1f] rounded-t-xl px-4 py-2.5 shadow-2xl border border-b-0 border-slate-300 flex items-center justify-between gap-3 w-72 sm:w-80 cursor-pointer hover:bg-[#e8f0fe] transition-all select-none animate-in slide-in-from-bottom-2 duration-200"
        onClick={() => setIsMinimized(false)}
        title="Clic para restaurar el redactor de correo"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8] shrink-0" />
          <span className="text-xs font-semibold truncate text-[#1f1f1f]">
            {asunto.trim() || (mode === 'invite' ? 'Nueva invitación' : 'Mensaje nuevo')}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-[#444746] hover:text-[#1f1f1f] hover:bg-slate-200 transition-colors cursor-pointer"
            title="Restaurar ventana"
          >
            <FiMaximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1 rounded text-[#444746] hover:text-rose-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // 2. RENDER VENTANA COMPACTA O MAXIMIZADA (Estilo exacto de Gmail)
  const windowClasses = isMaximized
    ? 'fixed inset-4 sm:inset-10 md:inset-14 max-w-4xl mx-auto z-[9999] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans'
    : 'fixed bottom-0 right-3 sm:right-6 md:right-8 z-[9999] w-[calc(100vw-24px)] sm:w-[520px] md:w-[560px] h-[550px] max-h-[90vh] bg-white rounded-t-2xl shadow-2xl border border-b-0 border-slate-300 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 font-sans';

  return createPortal(
    <>
      {isMaximized && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-[9998] transition-opacity"
          onClick={() => setIsMaximized(false)}
        />
      )}

      <div
        ref={containerRef}
        className={windowClasses}
        role="dialog"
        aria-labelledby="gmail-compose-heading"
        aria-modal="true"
      >
        {/* Cabecera Gmail: Fondo suave #f2f6fc, texto oscuro #1f1f1f y controles sutiles */}
        <div className="bg-[#f2f6fc] px-4 py-2.5 flex items-center justify-between select-none border-b border-[#e5e9f0] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 id="gmail-compose-heading" className="text-xs sm:text-sm font-semibold text-[#1f1f1f] truncate">
              {mode === 'invite' ? 'Nueva invitación institucional' : 'Mensaje nuevo'}
            </h2>
            {isSending && (
              <span className="text-[11px] text-[#0b57d0] font-medium animate-pulse ml-1">
                (Enviando...)
              </span>
            )}
          </div>

          <div className="flex items-center gap-0.5 shrink-0 text-[#444746]">
            {/* Minimizar */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-sm hover:bg-[#e0e7f1] hover:text-[#1f1f1f] transition-colors cursor-pointer"
              title="Minimizar"
            >
              <FiMinus size={14} />
            </button>

            {/* Maximizar / Pantalla completa */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-sm hover:bg-[#e0e7f1] hover:text-[#1f1f1f] transition-colors cursor-pointer"
              title={isMaximized ? 'Pantalla reducida' : 'Pantalla completa'}
            >
              {isMaximized ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-1.5 rounded-sm hover:bg-[#e0e7f1] hover:text-rose-600 transition-colors cursor-pointer"
              title="Guardar y cerrar"
            >
              <FiX size={15} />
            </button>
          </div>
        </div>

        {/* Selector de modo si tiene permisos de invitar */}
        {canInvite && (
          <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tipo de mensaje:
            </span>
            <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5 font-semibold">
              <button
                type="button"
                onClick={() => handleModeChange('email')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'email'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✉️ Mensaje Directo
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('invite')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'invite'
                    ? 'bg-[#0b57d0] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🤝 Invitación de Rol
              </button>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSend} className="flex-1 flex flex-col min-h-0 bg-white">
          {/* Fila: Para + Enlaces Cc / Cco en la esquina derecha */}
          <div className="flex items-center px-4 py-2 border-b border-[#f1f3f4] gap-2 shrink-0">
            <label htmlFor="gmail-to-input" className="w-12 text-xs font-normal text-slate-500 shrink-0">
              Para
            </label>
            <div className="flex-1 flex items-center flex-wrap gap-1.5 min-w-0">
              {recipientName && destinatario ? (
                <span className="inline-flex items-center gap-1.5 bg-[#e8f0fe] text-[#1967d2] px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#d2e3fc]">
                  <span>{recipientName}</span>
                  <span className="text-slate-500 text-[11px]">&lt;{destinatario}&gt;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientName('');
                      setDestinatario('');
                      recipientInputRef.current?.focus();
                    }}
                    className="hover:text-rose-600 font-bold cursor-pointer"
                    title="Remover destinatario"
                  >
                    ×
                  </button>
                </span>
              ) : (
                <input
                  id="gmail-to-input"
                  ref={recipientInputRef}
                  type="email"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder=""
                  disabled={isSending}
                  required
                  className="flex-1 min-w-[180px] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
                />
              )}
            </div>

            {/* Acciones de cabecera: Cc y Cco (Idéntico a la imagen) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0 select-none">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Cc
                </button>
              )}
              {!showCco && (
                <button
                  type="button"
                  onClick={() => setShowCco(true)}
                  className="hover:text-slate-900 hover:underline cursor-pointer"
                >
                  Cco
                </button>
              )}
            </div>
          </div>

          {/* Fila opcional: Cc */}
          {showCc && (
            <div className="flex items-center px-4 py-1.5 border-b border-[#f1f3f4] gap-2 shrink-0 animate-in fade-in duration-150">
              <label htmlFor="gmail-cc-input" className="w-12 text-xs font-normal text-slate-500 shrink-0">
                Cc
              </label>
              <input
                id="gmail-cc-input"
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="copia@ejemplo.com"
                disabled={isSending}
                className="flex-1 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                title="Quitar Cc"
              >
                ✕
              </button>
            </div>
          )}

          {/* Fila opcional: Cco */}
          {showCco && (
            <div className="flex items-center px-4 py-1.5 border-b border-[#f1f3f4] gap-2 shrink-0 animate-in fade-in duration-150">
              <label htmlFor="gmail-cco-input" className="w-12 text-xs font-normal text-slate-500 shrink-0">
                Cco
              </label>
              <input
                id="gmail-cco-input"
                type="email"
                value={cco}
                onChange={(e) => setCco(e.target.value)}
                placeholder="copia-oculta@ejemplo.com"
                disabled={isSending}
                className="flex-1 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setShowCco(false);
                  setCco('');
                }}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
                title="Quitar Cco"
              >
                ✕
              </button>
            </div>
          )}

          {/* Asignación de rol cuando está en modo invitación */}
          {mode === 'invite' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 border-b border-[#f1f3f4] bg-amber-50/60 gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-12 text-xs font-bold text-amber-900 shrink-0">
                  Rol
                </span>
                {isAdmin ? (
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    disabled={isSending}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 bg-white text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="MODERADOR">🛡️ Moderador de Plataforma</option>
                    <option value="MARKETING">📢 Especialista de Marketing</option>
                  </select>
                ) : isRepresentante ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                    <FiShield size={12} className="text-amber-700" />
                    <span>OPERADOR (Control de Accesos)</span>
                  </div>
                ) : null}
              </div>

              <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                <FiInfo size={12} className="shrink-0 text-amber-600" />
                <span>Enlace válido por 24 horas</span>
              </div>
            </div>
          )}

          {/* Fila: Asunto */}
          <div className="flex items-center px-4 py-2 border-b border-[#f1f3f4] gap-2 shrink-0">
            <input
              id="gmail-subject-input"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Asunto"
              disabled={isSending}
              required={mode === 'email'}
              className="w-full text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
            />
          </div>

          {/* Cuerpo del Mensaje */}
          <div className="flex-1 p-4 min-h-[180px] flex flex-col overflow-y-auto">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder=""
              disabled={isSending}
              required={mode === 'email'}
              className="w-full flex-1 text-xs sm:text-sm leading-relaxed text-[#1f1f1f] placeholder:text-slate-400 bg-transparent resize-none outline-none font-sans font-normal"
            />
          </div>

          {/* Barra Inferior Estilo Gmail: Split button Enviar + Toolbar de Íconos + Papelera */}
          <div className="px-4 py-2.5 bg-white border-t border-slate-200/60 flex items-center justify-between gap-3 shrink-0 select-none">
            {/* Lado izquierdo: Botón Enviar + Íconos */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botón Enviar dividido estilo Gmail */}
              <div className="relative inline-flex items-center">
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-l-full bg-[#0b57d0] hover:bg-[#0842a0] text-white text-xs sm:text-sm font-medium shadow-2xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>{mode === 'invite' ? 'Enviar Invitación' : 'Enviar'}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowScheduleMenu((prev) => !prev)}
                  disabled={isSending}
                  className="p-2 rounded-r-full bg-[#0b57d0] hover:bg-[#0842a0] text-white border-l border-white/25 transition-all cursor-pointer"
                  title="Más opciones de envío"
                >
                  <FiChevronDown size={14} />
                </button>

                {/* Menú desplegable opcional de Programar envío */}
                {showScheduleMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleMenu(false);
                        handleSend();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between"
                    >
                      <span>Enviar ahora</span>
                      <span className="text-[10px] text-slate-400">Inmediato</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowScheduleMenu(false);
                        Swal.fire({
                          icon: 'info',
                          title: 'Programar envío',
                          text: 'El despacho del correo se realizará automáticamente a través del microservicio de Gmail API.',
                          confirmButtonColor: '#0b57d0',
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between"
                    >
                      <span>Programar envío</span>
                      <span className="text-[10px] text-slate-400">Auto</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Íconos de Barra de Formato de Gmail (Replicados fielmente según la imagen) */}
              <div className="flex items-center gap-0.5 text-[#444746] ml-1">
                {/* 1. Opciones de Formato: Aa */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center font-serif font-bold text-xs cursor-pointer transition-colors"
                  title="Opciones de formato"
                >
                  Aa
                </button>

                {/* 2. Asistente con IA / Ayúdame a escribir (Varita mágica) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!mensaje.trim()) {
                      setMensaje('Estimado usuario,\n\nNos comunicamos desde el equipo directivo de EventHive para compartir una actualización importante sobre su cuenta y servicios asociados.\n\nAtentamente,\nEquipo EventHive');
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Sugerir redacción institucional"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29c-.39-.39-1.02-.39-1.41 0L1.29 18.96c-.39.39-.39 1.02 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05c.39-.39.39-1.02 0-1.41l-2.33-2.35zm-1.06 3.47l-1.77-1.77 1.41-1.41 1.77 1.77-1.41 1.41z" />
                  </svg>
                </button>

                {/* 3. Adjuntar archivos (Clip) */}
                <button
                  type="button"
                  onClick={() => {
                    Swal.fire({
                      icon: 'info',
                      title: 'Adjuntar archivos',
                      text: 'Los correos institucionales de EventHive admiten hasta 25 MB en documentos a través de la integración Gmail API.',
                      confirmButtonColor: '#0b57d0',
                    });
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Adjuntar archivos"
                >
                  <FiPaperclip size={15} />
                </button>

                {/* 4. Insertar enlace */}
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Ingresa la URL del enlace a insertar:');
                    if (url) {
                      setMensaje((prev) => `${prev}\n${url}`);
                    }
                  }}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Insertar enlace"
                >
                  <FiLink2 size={15} />
                </button>

                {/* 5. Insertar emoji */}
                <button
                  type="button"
                  onClick={() => setMensaje((prev) => `${prev} 😊`)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Insertar emoji"
                >
                  <FiSmile size={15} />
                </button>

                {/* 6. Insertar archivos desde Google Drive */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Insertar archivos con Drive"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7.71 3.5L1.15 15l3.43 6 6.55-11.5M9.73 15L6.3 21h13.12l3.43-6M22.85 15l-6.57-11.5H9.43L16 15" />
                  </svg>
                </button>

                {/* 7. Insertar foto */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Insertar foto"
                >
                  <FiImage size={15} />
                </button>

                {/* 8. Modo confidencial (Candado con reloj) */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Alternar el modo confidencial"
                >
                  <FiLock size={14} />
                </button>

                {/* 9. Insertar firma */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Insertar firma"
                >
                  <FiEdit2 size={14} />
                </button>

                {/* 10. Más opciones */}
                <button
                  type="button"
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  title="Más opciones"
                >
                  <FiMoreVertical size={14} />
                </button>
              </div>
            </div>

            {/* Lado derecho: Descartar borrador (Papelera) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttemptClose}
                disabled={isSending}
                className="w-8 h-8 rounded-full text-slate-500 hover:text-rose-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                title="Descartar borrador"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
