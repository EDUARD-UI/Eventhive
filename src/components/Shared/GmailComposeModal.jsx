import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiMinus,
  FiMaximize2,
  FiMinimize2,
  FiSend,
  FiTrash2,
  FiMail,
  FiUserPlus,
  FiShield,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { session, normalizeRole } from '../../services/session.js';
import adminService from '../../features/admin/services/adminService.js';
import { organizerService } from '../../services/organizerService.js';

/**
 * Compositor de Correo Estilo Gmail
 * Componente flotante en la parte inferior derecha, réplica fiel del widget compacto de Gmail.
 * Soporta:
 * - Minimizar a una barra inferior compacta
 * - Maximizar a pantalla ampliada
 * - Alternar entre correo directo e invitación oficial con rol autorizado
 * - Conservación de borradores y advertencia antes de descartar
 * - Validación estricta y estados de carga
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

  // Estados del compositor
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [mode, setMode] = useState(initialMode === 'invite' && canInvite ? 'invite' : 'email');
  const [destinatario, setDestinatario] = useState(initialEmail || '');
  const [recipientName, setRecipientName] = useState(initialName || '');
  const [rol, setRol] = useState(
    isRepresentante ? 'OPERADOR' : defaultRole === 'MARKETING' ? 'MARKETING' : 'MODERADOR'
  );
  const [asunto, setAsunto] = useState(defaultSubject || '');
  const [mensaje, setMensaje] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const containerRef = useRef(null);
  const recipientInputRef = useRef(null);

  // Inicialización cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIsMinimized(false);
      setIsMaximized(false);
      setDestinatario(initialEmail || '');
      setRecipientName(initialName || '');
      setAsunto(defaultSubject || '');
      setMensaje('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setMode(initialMode === 'invite' && canInvite ? 'invite' : 'email');
      setRol(isRepresentante ? 'OPERADOR' : defaultRole === 'MARKETING' ? 'MARKETING' : 'MODERADOR');

      // Autofocus en el campo de texto o destinatario
      setTimeout(() => {
        recipientInputRef.current?.focus();
      }, 120);
    }
  }, [isOpen, initialEmail, initialName, defaultSubject, defaultRole, initialMode, canInvite, isRepresentante]);

  // Si cambia a modo invitación y el asunto está vacío, pre-llenar uno sugerido
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrorMsg(null);
    if (newMode === 'invite' && (!asunto.trim() || asunto.trim() === 'Comunidado institucional')) {
      const rolTexto = isAdmin ? (rol === 'MARKETING' ? 'Marketing' : 'Moderador') : 'Operador';
      setAsunto(`Invitación para unirte al equipo de EventHive como ${rolTexto}`);
    }
  };

  // Gestión de cierre con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMinimized, destinatario, asunto, mensaje]);

  if (!isOpen) return null;

  // Confirmación si hay borrador sin enviar
  const hasContent = Boolean(destinatario.trim() || asunto.trim() || mensaje.trim());

  const handleAttemptClose = async () => {
    if (hasContent && !successMsg) {
      const res = await Swal.fire({
        title: '¿Descartar borrador?',
        text: 'Hay datos redactados en este mensaje. Si cierras la ventana se perderán los cambios.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, descartar',
        cancelButtonText: 'Continuar editando',
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#0F172A',
      });
      if (!res.isConfirmed) return;
    }
    onClose();
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();

    const emailTrim = destinatario.trim();
    const asuntoTrim = asunto.trim();
    const mensajeTrim = mensaje.trim();

    setErrorMsg(null);
    setSuccessMsg(null);

    // Validaciones
    if (!emailTrim) {
      setErrorMsg('Debes especificar un correo electrónico para el destinatario.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setErrorMsg('El formato del correo electrónico ingresado no es válido.');
      return;
    }

    if (mode === 'email') {
      if (!asuntoTrim) {
        setErrorMsg('El campo "Asunto" es obligatorio para enviar un correo.');
        return;
      }
      if (!mensajeTrim) {
        setErrorMsg('Debes redactar un mensaje en el cuerpo del correo.');
        return;
      }
    }

    setIsSending(true);

    try {
      if (mode === 'invite') {
        // FLUJO DE INVITACIÓN OFICIAL CON REGISTRO DE ROL
        if (isAdmin) {
          // POST /api/admin/correos/invitar
          await adminService.invitarRol({ correo: emailTrim, rol });
          setSuccessMsg(
            `Invitación oficial enviada con éxito a ${emailTrim} para asumir el rol de ${rol}.`
          );
        } else if (isRepresentante) {
          // POST /api/organizaciones/invitar?correo={correo}
          await organizerService.invitarOperador(emailTrim);
          setSuccessMsg(
            `Invitación oficial enviada con éxito a ${emailTrim} para vincularse como Operador de tu organización.`
          );
        } else {
          throw new Error('No cuentas con autorización para despachar invitaciones de roles.');
        }
      } else {
        // FLUJO DE CORREO DIRECTO (SIN ASIGNACIÓN DE ROL)
        await adminService.enviarCorreoAdmin({
          destinatario: emailTrim,
          asunto: asuntoTrim,
          mensaje: mensajeTrim,
        });
        setSuccessMsg(`Correo enviado exitosamente a ${emailTrim}.`);
      }

      if (onSuccess) {
        onSuccess({
          mode,
          email: emailTrim,
          rol: mode === 'invite' ? rol : null,
          asunto: asuntoTrim,
        });
      }

      // Cerrar automáticamente tras confirmar visualmente el éxito
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 401) {
        setErrorMsg('Tu sesión ha expirado o no es válida. Por favor recarga e inicia sesión.');
      } else if (status === 403) {
        setErrorMsg(
          'Acceso denegado (403): Tu cuenta no dispone de permisos suficientes para realizar esta acción.'
        );
      } else {
        setErrorMsg(
          err?.message ||
            err?.response?.data?.message ||
            'Ocurrió un error inesperado al procesar la solicitud. Tu borrador se ha conservado.'
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  // 1. Render Minimizado estilo Gmail (Barra / Pestaña inferior derecha)
  if (isMinimized) {
    return createPortal(
      <div
        className="fixed bottom-0 right-4 sm:right-8 z-[9999] bg-[#0F172A] text-white rounded-t-xl px-4 py-2.5 shadow-2xl border border-b-0 border-slate-700/80 flex items-center justify-between gap-3 w-72 sm:w-80 cursor-pointer hover:bg-slate-900 transition-all select-none animate-in slide-in-from-bottom-2 duration-200"
        onClick={() => setIsMinimized(false)}
        title="Clic para expandir el redactor de correo"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
          <span className="text-xs font-bold truncate">
            {asunto.trim() || (mode === 'invite' ? 'Nueva invitación' : 'Mensaje nuevo')}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Restaurar ventana"
          >
            <FiMaximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // 2. Render de Ventana de Redacción (Compacta o Maximizada)
  const windowClasses = isMaximized
    ? 'fixed inset-4 sm:inset-10 md:inset-14 max-w-4xl mx-auto z-[9999] bg-white dark:bg-[#131B2E] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100'
    : 'fixed bottom-0 right-3 sm:right-6 md:right-8 z-[9999] w-[calc(100vw-24px)] sm:w-[500px] md:w-[540px] h-[530px] max-h-[88vh] bg-white dark:bg-[#131B2E] rounded-t-2xl shadow-2xl border border-b-0 border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 text-slate-800 dark:text-slate-100';

  return createPortal(
    <>
      {/* Backdrop transparente / difuso solo cuando está maximizado */}
      {isMaximized && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-[9998] transition-opacity"
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
        {/* Cabecera Gmail */}
        <div className="bg-[#0F172A] text-white px-4 py-2.5 flex items-center justify-between select-none border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
              {mode === 'invite' ? <FiUserPlus size={12} /> : <FiMail size={12} />}
            </div>
            <h2 id="gmail-compose-heading" className="text-xs sm:text-sm font-semibold truncate text-white">
              {mode === 'invite' ? 'Nueva invitación de equipo' : 'Mensaje nuevo'}
            </h2>
            {isSending && (
              <span className="text-[10px] text-amber-300 font-medium animate-pulse ml-1">
                (Enviando...)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Minimizar */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimizar"
            >
              <FiMinus size={13} />
            </button>

            {/* Maximizar / Restaurar */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={isMaximized ? 'Pantalla reducida' : 'Pantalla completa'}
            >
              {isMaximized ? <FiMinimize2 size={13} /> : <FiMaximize2 size={13} />}
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={handleAttemptClose}
              className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Guardar y cerrar"
            >
              <FiX size={14} />
            </button>
          </div>
        </div>

        {/* Selector de Propósito (Solo si tiene permisos para invitar) */}
        {canInvite && (
          <div className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 px-4 py-1.5 flex items-center justify-between gap-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Acción:
            </span>
            <div className="inline-flex rounded-lg bg-slate-200/70 dark:bg-slate-800 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleModeChange('email')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'email'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ✉️ Mensaje Directo
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('invite')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'invite'
                    ? 'bg-[#0F172A] text-amber-300 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                🤝 Invitación de Rol
              </button>
            </div>
          </div>
        )}

        {/* Alertas de error o éxito */}
        {errorMsg && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 px-4 py-2 flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs font-medium animate-in fade-in shrink-0">
            <FiAlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-rose-400 hover:text-rose-700 dark:hover:text-rose-200 ml-1 font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 px-4 py-2 flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in shrink-0">
            <FiCheckCircle size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Formulario de Redacción */}
        <form onSubmit={handleSend} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Fila: Destinatarios (Para) */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-slate-800 focus-within:border-brand/40 transition-colors gap-2 shrink-0">
            <label htmlFor="compose-para" className="w-12 text-xs font-medium text-slate-400 shrink-0">
              Para
            </label>
            <div className="flex-1 flex items-center flex-wrap gap-1.5 min-w-0">
              {recipientName && destinatario && (
                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                  <span>{recipientName}</span>
                  <span className="text-slate-400 text-[10px]">&lt;{destinatario}&gt;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRecipientName('');
                      setDestinatario('');
                      recipientInputRef.current?.focus();
                    }}
                    className="hover:text-rose-500 ml-0.5 cursor-pointer"
                    title="Remover destinatario"
                  >
                    ×
                  </button>
                </span>
              )}
              {(!recipientName || !destinatario) && (
                <input
                  id="compose-para"
                  ref={recipientInputRef}
                  type="email"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder="destinatario@correo.com"
                  disabled={isSending}
                  required
                  className="flex-1 min-w-[200px] text-xs sm:text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
                />
              )}
            </div>
          </div>

          {/* Fila: Asignación de Rol (Modo Invitación) */}
          {mode === 'invite' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20 gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <label htmlFor="compose-role" className="w-12 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                  Rol
                </label>

                {isAdmin ? (
                  <select
                    id="compose-role"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    disabled={isSending}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="MODERADOR">🛡️ Moderador de Plataforma</option>
                    <option value="MARKETING">📢 Especialista de Marketing</option>
                  </select>
                ) : isRepresentante ? (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300/80 dark:border-amber-700/80 text-xs font-bold">
                    <FiShield size={12} className="text-amber-700 dark:text-amber-400" />
                    <span>OPERADOR (Equipo Operativo)</span>
                  </div>
                ) : null}
              </div>

              <div className="text-[11px] text-amber-800 dark:text-amber-300/90 font-medium flex items-center gap-1">
                <FiInfo size={12} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Token válido por 24 horas</span>
              </div>
            </div>
          )}

          {/* Fila: Asunto */}
          <div className="flex items-center px-4 py-2 border-b border-slate-100 dark:border-slate-800 focus-within:border-brand/40 transition-colors gap-2 shrink-0">
            <input
              id="compose-subject"
              type="text"
              value={asunto}
              onChange={(e) => setAsunto(e.target.value)}
              placeholder="Asunto"
              disabled={isSending}
              required={mode === 'email'}
              className="w-full text-xs sm:text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
            />
          </div>

          {/* Cuerpo del Mensaje */}
          <div className="flex-1 p-4 min-h-[160px] flex flex-col overflow-y-auto">
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={
                mode === 'invite'
                  ? 'Mensaje personalizado que acompañará la invitación (opcional)...'
                  : 'Escribe aquí tu comunicado o mensaje...'
              }
              disabled={isSending}
              required={mode === 'email'}
              className="w-full flex-1 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-100 placeholder:text-slate-400 bg-transparent resize-none outline-none font-sans font-normal"
            />
          </div>

          {/* Barra de Acciones Inferior Estilo Gmail */}
          <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <FiSend size={13} />
                    <span>{mode === 'invite' ? 'Enviar Invitación' : 'Enviar'}</span>
                  </>
                )}
              </button>

              {hasContent && (
                <button
                  type="button"
                  onClick={handleAttemptClose}
                  disabled={isSending}
                  className="p-2 rounded-full text-slate-400 hover:text-rose-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Descartar borrador"
                >
                  <FiTrash2 size={15} />
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-medium select-none">
              {hasContent ? 'Borrador activo' : 'Listo'}
            </div>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
}
