import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiSend, FiMail, FiPaperclip, FiCheck } from 'react-icons/fi';
import adminService from '../../features/admin/services/adminService.js';
import { showSuccessAlert, showErrorAlert } from '../../utils/alertUtils.js';

export default function ComposeMailDrawer({
  isOpen,
  onClose,
  recipientEmail = '',
  recipientName = '',
  initialSubject = '',
  initialBody = '',
  onSuccess,
}) {
  const [destinatario, setDestinatario] = useState(recipientEmail);
  const [asunto, setAsunto] = useState(initialSubject);
  const [mensaje, setMensaje] = useState(initialBody);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const subjectInputRef = useRef(null);
  const recipientInputRef = useRef(null);

  // Al abrir el drawer, auto-completar y gestionar el foco
  useEffect(() => {
    if (isOpen) {
      setDestinatario(recipientEmail || '');
      setAsunto(initialSubject || '');
      setMensaje(initialBody || '');
      setError('');

      // Si viene destinatario predeterminado, enfocar directamente el campo Asunto
      setTimeout(() => {
        if (recipientEmail) {
          subjectInputRef.current?.focus();
        } else {
          recipientInputRef.current?.focus();
        }
      }, 100);
    }
  }, [isOpen, recipientEmail, initialSubject, initialBody]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSending && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSending, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailTrim = destinatario.trim();
    const asuntoTrim = asunto.trim();
    const mensajeTrim = mensaje.trim();

    if (!emailTrim) {
      setError('Por favor indica el correo del destinatario.');
      recipientInputRef.current?.focus();
      return;
    }
    if (!asuntoTrim) {
      setError('Por favor añade un asunto para la comunicación.');
      subjectInputRef.current?.focus();
      return;
    }
    if (!mensajeTrim) {
      setError('Debes redactar un mensaje en el cuerpo del comunicado.');
      return;
    }

    try {
      setIsSending(true);
      setError('');

      await adminService.enviarCorreoAdmin({
        destinatario: emailTrim,
        asunto: asuntoTrim,
        mensaje: mensajeTrim,
      });

      await showSuccessAlert({
        title: 'Comunicado despachado',
        text: `El mensaje oficial ha sido transmitido exitosamente a ${emailTrim}.`,
      });

      if (onSuccess) {
        onSuccess({
          destinatario: emailTrim,
          asunto: asuntoTrim,
          mensaje: mensajeTrim,
        });
      }

      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'No fue posible despachar el comunicado.';
      setError(msg);
      showErrorAlert('Error en transmisión', msg);
    } finally {
      setIsSending(false);
    }
  };

  const drawerContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(15, 35, 66, 0.72)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSending) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-xl max-w-full bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-2xl h-[100dvh] sm:h-full flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Azul Institucional #0F2342 */}
        <div className="p-5 bg-[#0F2342] text-white flex items-center justify-between border-b border-[#0F2342] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#F5B800]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-300 font-bold">
                Despacho Oficial de Gira & Producción
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
              Nueva Comunicación Oficial
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer rounded-[2px]"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Cuerpo del Despacho con líneas horizontales finas 1px solid #E2E8F0 */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]">
            {error && (
              <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs font-mono text-rose-700">
                {error}
              </div>
            )}

            {/* Campo: Para */}
            <div className="p-4 flex items-center gap-3">
              <label
                htmlFor="compose-para"
                className="font-mono text-xs uppercase tracking-wider text-[#64748B] w-20 shrink-0 font-bold"
              >
                Para:
              </label>
              <input
                id="compose-para"
                ref={recipientInputRef}
                type="email"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                placeholder="correo@organizacion.com"
                required
                className="w-full font-mono text-xs text-[#0F2342] placeholder-[#94A3B8] outline-none bg-transparent"
              />
            </div>

            {/* Campo: Asunto */}
            <div className="p-4 flex items-center gap-3">
              <label
                htmlFor="compose-asunto"
                className="font-mono text-xs uppercase tracking-wider text-[#64748B] w-20 shrink-0 font-bold"
              >
                Asunto:
              </label>
              <input
                id="compose-asunto"
                ref={subjectInputRef}
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Ej: Requerimiento técnico de aforo para cartelera..."
                required
                className="w-full font-sans text-sm font-semibold text-[#0F2342] placeholder-[#94A3B8] outline-none bg-transparent"
              />
            </div>

            {/* Campo: Cuerpo del Mensaje */}
            <div className="p-4 flex-1 flex flex-col">
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe aquí los términos oficiales de la comunicación o requerimiento de producción..."
                rows={12}
                required
                className="w-full flex-1 p-3 border border-[#E2E8F0] rounded-[2px] font-sans text-sm text-[#0F2342] placeholder-[#94A3B8] focus:border-[#0F2342] outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Footer de Envío en #0F2342 con acento #F5B800 */}
          <div className="p-4 sm:p-5 bg-[#FFFFFF] border-t border-[#E2E8F0] flex items-center justify-between gap-3 shrink-0 sticky bottom-0 z-10 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <span className="font-mono text-[11px] text-[#64748B] hidden sm:inline">
              Firma y protocolo oficial EventHive
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-4 py-2 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F2342] hover:bg-[#F5B800] hover:text-[#0F2342] text-white font-mono text-xs uppercase tracking-wider font-bold rounded-[2px] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <FiSend size={13} className="text-[#F5B800] group-hover:text-[#0F2342]" />
                <span>{isSending ? 'Transmitiendo...' : 'Transmitir Mensaje'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
}
