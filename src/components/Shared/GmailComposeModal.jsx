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
 * Componente flotante en la parte inferior derecha, con soporte para minimizar,
 * alternar entre envío normal e invitación oficial con asignación de rol autorizada en el backend.
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
  const token = session.getToken();
  const rawRole = user?.role || user?.rolNombre || user?.rol;
  const userRole = normalizeRole(rawRole);

  const isAdmin = userRole === 'ADMINISTRADOR';
  const isRepresentante = userRole === 'REPRESENTANTE';
  const canInvite = isAdmin || isRepresentante;

  // Estados del compositor
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState(initialMode === 'invite' && canInvite ? 'invite' : 'email');
  const [destinatario, setDestinatario] = useState(initialEmail || '');
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
      setDestinatario(initialEmail || '');
      setAsunto(defaultSubject || '');
      setMensaje('');
      setErrorMsg(null);
      setSuccessMsg(null);
      setMode(initialMode === 'invite' && canInvite ? 'invite' : 'email');
      setRol(isRepresentante ? 'OPERADOR' : defaultRole === 'MARKETING' ? 'MARKETING' : 'MODERADOR');

      // Autofocus accesible
      setTimeout(() => {
        recipientInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialEmail, defaultSubject, defaultRole, initialMode, canInvite, isRepresentante]);

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

    // Validaciones básicas
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
        if (isAdmin) {
          // POST /api/admin/correos/enviar
          await adminService.enviarCorreoAdmin({
            destinatario: emailTrim,
            asunto: asuntoTrim,
            mensaje: mensajeTrim,
          });
          setSuccessMsg(`Correo enviado exitosamente a ${emailTrim}.`);
        } else {
          // Si otro rol autenticado envía correo administrativo
          await adminService.enviarCorreoAdmin({
            destinatario: emailTrim,
            asunto: asuntoTrim,
            mensaje: mensajeTrim,
          });
          setSuccessMsg(`Correo enviado exitosamente a ${emailTrim}.`);
        }
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
      }, 1800);
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

  // Render Minimizado estilo Gmail (Pill inferior derecha)
  if (isMinimized) {
    return createPortal(
      <div
        className="fixed bottom-0 right-4 sm:right-8 z-[9999] bg-[#0F172A] text-white rounded-t-2xl px-4 py-2.5 shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 w-72 sm:w-80 cursor-pointer hover:bg-slate-900 transition-all select-none animate-in slide-in-from-bottom-2 duration-200"
        onClick={() => setIsMinimized(false)}
        title="Clic para expandir el redactor"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="text-xs font-bold truncate">
            {asunto.trim() || (mode === 'invite' ? 'Nueva invitación' : 'Nuevo mensaje')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Restaurar"
          >
            <FiMaximize2 size={13} />
          </button>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // Render Expandido estilo Gmail (Ventana flotante inferior derecha)
  return createPortal(
    <div
      ref={containerRef}
      className="fixed bottom-0 right-2 sm:right-6 md:right-8 z-[9999] w-[calc(100vw-16px)] sm:w-[500px] md:w-[560px] max-h-[92vh] sm:max-h-[82vh] bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200 text-slate-800"
      role="dialog"
      aria-labelledby="compose-heading"
      aria-modal="true"
    >
      {/* 1. Header Compacto Estilo Gmail */}
      <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center justify-between select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
            {mode === 'invite' ? <FiUserPlus size={13} /> : <FiMail size={13} />}
          </div>
          <h2 id="compose-heading" className="text-xs sm:text-sm font-bold truncate text-white">
            {mode === 'invite' ? 'Nueva Invitación de Equipo' : 'Nuevo Mensaje'}
          </h2>
          {isSending && (
            <span className="text-[10px] text-amber-300 font-medium animate-pulse ml-1">
              (Enviando...)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Minimizar ventana"
          >
            <FiMinus size={14} />
          </button>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <FiX size={15} />
          </button>
        </div>
      </div>

      {/* 2. Selector de Acción (Solo si está autorizado a invitar) */}
      {canInvite && (
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Tipo de Acción:
          </span>
          <div className="inline-flex rounded-xl bg-slate-200/70 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleModeChange('email')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'email'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✉️ Correo Normal
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('invite')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === 'invite'
                  ? 'bg-[#0F172A] text-amber-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🤝 Invitar Usuario
            </button>
          </div>
        </div>
      )}

      {/* 3. Mensajes de Estado (Alertas internas) */}
      {errorMsg && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-start gap-2 text-rose-800 text-xs font-medium animate-in fade-in">
          <FiAlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-700 ml-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-start gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
          <FiCheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
          <span className="flex-1">{successMsg}</span>
        </div>
      )}

      {/* 4. Cuerpo del Compositor con Separadores Sutiles */}
      <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-y-auto">
        {/* Fila: Destinatario (Para:) */}
        <div className="flex items-center px-4 py-2.5 border-b border-slate-100 focus-within:border-brand/40 transition-colors">
          <label htmlFor="compose-para" className="w-16 text-xs font-bold text-slate-500 shrink-0">
            Para:
          </label>
          <input
            id="compose-para"
            ref={recipientInputRef}
            type="email"
            value={destinatario}
            onChange={(e) => setDestinatario(e.target.value)}
            placeholder="destinatario@correo.com"
            disabled={isSending}
            required
            className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
          />
          {initialName && (
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0 ml-1">
              {initialName}
            </span>
          )}
        </div>

        {/* Fila Condicional: Selector de Rol (Solo en Modo Invitación) */}
        {mode === 'invite' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-amber-50/40 gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="compose-role" className="w-16 text-xs font-bold text-amber-900 shrink-0">
                Rol:
              </label>

              {isAdmin ? (
                // Administrador: selector de roles autorizados por backend (MODERADOR, MARKETING)
                <select
                  id="compose-role"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  disabled={isSending}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="MODERADOR">🛡️ Moderador de Plataforma</option>
                  <option value="MARKETING">📢 Especialista de Marketing</option>
                </select>
              ) : isRepresentante ? (
                // Representante: rol estrictamente fijado a OPERADOR de su organización
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
                  <FiShield size={12} className="text-amber-700" />
                  <span>OPERADOR (Equipo Operativo)</span>
                </div>
              ) : null}
            </div>

            <div className="text-[11px] text-amber-800/80 font-medium flex items-center gap-1">
              <FiInfo size={12} className="shrink-0 text-amber-600" />
              <span>Token válido por 24 horas</span>
            </div>
          </div>
        )}

        {/* Fila: Asunto */}
        <div className="flex items-center px-4 py-2.5 border-b border-slate-100 focus-within:border-brand/40 transition-colors">
          <label htmlFor="compose-subject" className="w-16 text-xs font-bold text-slate-500 shrink-0">
            Asunto:
          </label>
          <input
            id="compose-subject"
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder={
              mode === 'invite'
                ? 'Invitación oficial a EventHive'
                : 'Asunto de la comunicación institucional'
            }
            disabled={isSending}
            required={mode === 'email'}
            className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent outline-none disabled:opacity-60"
          />
        </div>

        {/* Área de Mensaje */}
        <div className="flex-1 p-4 min-h-[160px] sm:min-h-[190px] flex flex-col">
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder={
              mode === 'invite'
                ? 'Mensaje personalizado que acompañará la invitación (opcional)...'
                : 'Escribe aquí tu comunicado o mensaje para el destinatario...'
            }
            disabled={isSending}
            required={mode === 'email'}
            rows={6}
            className="w-full flex-1 text-xs sm:text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 bg-transparent resize-none outline-none font-normal"
          />
        </div>

        {/* Footer / Barra de Acciones */}
        <div className="px-4 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FiSend size={13} />
                  <span>{mode === 'invite' ? 'Enviar Invitación' : 'Enviar Correo'}</span>
                </>
              )}
            </button>

            {hasContent && (
              <button
                type="button"
                onClick={handleAttemptClose}
                disabled={isSending}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-200/50 transition-colors"
                title="Descartar borrador"
              >
                <FiTrash2 size={15} />
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            {hasContent ? 'Borrador activo' : 'Listo'}
          </div>
        </div>
      </form>
    </div>,
    document.body
  );
}
