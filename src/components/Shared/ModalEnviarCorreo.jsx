import React, { useState, useEffect } from 'react';
import { FiX, FiMail, FiSend, FiUser, FiCheckCircle, FiFileText } from 'react-icons/fi';
import Swal from 'sweetalert2';

/**
 * ModalEnviarCorreo
 * Interfaz genérica para el envío de correos electrónicos a trabajadores/operadores/moderadores.
 * Permite ingresar destinatario, asunto y mensaje con feedback y estado de carga.
 */
export default function ModalEnviarCorreo({
  isOpen,
  onClose,
  initialEmail = '',
  initialName = '',
  defaultSubject = '',
  title = 'Enviar Correo Electrónico',
  subtitle = 'Comunícate directamente con el colaborador mediante correo electrónico',
  onSendSuccess,
}) {
  const [destinatario, setDestinatario] = useState(initialEmail || '');
  const [asunto, setAsunto] = useState(defaultSubject || '');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDestinatario(initialEmail || '');
      setAsunto(defaultSubject || '');
      setMensaje('');
    }
  }, [isOpen, initialEmail, defaultSubject]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailTrimmed = destinatario.trim();
    const asuntoTrimmed = asunto.trim();
    const mensajeTrimmed = mensaje.trim();

    if (!emailTrimmed) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Por favor indica la dirección de correo electrónico del destinatario.',
      });
      return;
    }

    if (!asuntoTrimmed) {
      Swal.fire({
        icon: 'warning',
        title: 'Asunto requerido',
        text: 'Por favor ingresa un asunto para el correo.',
      });
      return;
    }

    if (!mensajeTrimmed) {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje requerido',
        text: 'Por favor redacta el mensaje que deseas enviar.',
      });
      return;
    }

    try {
      setLoading(true);
      // Simular latencia de red para despacho de correo
      await new Promise((resolve) => setTimeout(resolve, 800));

      await Swal.fire({
        icon: 'success',
        title: 'Correo enviado exitosamente',
        text: `El correo con asunto "${asuntoTrimmed}" ha sido despachado a ${emailTrimmed}.`,
        confirmButtonColor: '#0f172a',
      });

      if (onSendSuccess) {
        onSendSuccess({ email: emailTrimmed, asunto: asuntoTrimmed, mensaje: mensajeTrimmed });
      }

      onClose();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error al enviar',
        text: err?.message || 'No fue posible enviar el correo. Inténtalo nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral deslizante hacia la derecha */}
      <div
        className="relative z-50 w-full sm:w-[480px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Cabecera del drawer */}
          <div className="relative bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <FiMail size={20} />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* Formulario */}
          <form id="email-drawer-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {initialName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                <FiUser className="shrink-0 text-amber-600" />
                <span>
                  Destinatario: <strong className="font-bold">{initialName}</strong>
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={destinatario}
                  onChange={(e) => setDestinatario(e.target.value)}
                  placeholder="usuario@correo.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Asunto <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej. Notificación administrativa..."
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Mensaje <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe el cuerpo del correo aquí..."
                required
                className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer fijo del drawer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="email-drawer-form"
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <FiSend size={14} />
            <span>{loading ? 'Enviando...' : 'Enviar Correo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
