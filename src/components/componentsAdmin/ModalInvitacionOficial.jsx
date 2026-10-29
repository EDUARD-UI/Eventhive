import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Mail,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { sanitizeEmail } from '../../utils/sanitizer.js';

export default function ModalInvitacionOficial({
  isOpen,
  onClose,
  onSendInvite,
  onSendComunicado,
  mode = 'invite', // 'invite' | 'comunicado'
  initialEmail = '',
  initialName = '',
}) {
  const [email, setEmail] = useState(initialEmail || '');
  const [rol, setRol] = useState('MODERADOR'); // 'MODERADOR' | 'MARKETING'
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    try {
      setSubmitting(true);
      if (mode === 'invite') {
        await onSendInvite({
          email: cleanEmail,
          rol,
        });
      } else {
        if (!asunto.trim()) {
          setError('El asunto del comunicado es obligatorio.');
          setSubmitting(false);
          return;
        }
        if (!mensaje.trim()) {
          setError('El mensaje del comunicado es obligatorio.');
          setSubmitting(false);
          return;
        }
        await onSendComunicado({
          destinatario: cleanEmail,
          asunto: asunto.trim(),
          mensaje: mensaje.trim(),
        });
      }
      onClose();
    } catch (err) {
      setError(err?.message || 'Error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera SaaS */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              {mode === 'invite' ? <UserPlus size={20} /> : <Mail size={20} />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {mode === 'invite'
                  ? 'Invitar Miembro del Equipo'
                  : 'Comunicado Administrativo Oficial'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'invite'
                  ? 'Genera un enlace seguro con vigencia de 24 horas'
                  : 'Envía un mensaje oficial directo al correo del usuario'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Correo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Correo Electrónico <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@dominio.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          {/* Si es invitación: Rol oficial */}
          {mode === 'invite' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Rol a Conceder <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol('MODERADOR')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    rol === 'MODERADOR'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">MODERADOR</span>
                    <Shield size={14} className={rol === 'MODERADOR' ? 'text-amber-500' : 'text-slate-400'} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Revisión y publicación de eventos culturales
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRol('MARKETING')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    rol === 'MARKETING'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-xs">MARKETING</span>
                    <Shield size={14} className={rol === 'MARKETING' ? 'text-amber-500' : 'text-slate-400'} />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    Gestión de posicionamiento, carrusel y destacados
                  </p>
                </button>
              </div>

              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  El usuario recibirá un correo con token seguro de un solo uso. Si no lo acepta en 24 horas, la invitación expirará automáticamente.
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Asunto y Mensaje de comunicado */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Asunto <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej: Actualización de políticas de moderación"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Mensaje <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe el mensaje formal para el destinatario..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                />
              </div>
            </>
          )}

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {submitting ? (
                <span>Enviando...</span>
              ) : (
                <>
                  <Send size={13} />
                  <span>{mode === 'invite' ? 'Enviar Invitación' : 'Enviar Comunicado'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

