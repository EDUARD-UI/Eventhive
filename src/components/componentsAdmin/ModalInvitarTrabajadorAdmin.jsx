import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  Mail,
  User,
  Phone,
  Shield,
  FileText,
  Send,
  CheckCircle2,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function ModalInvitarTrabajadorAdmin({
  isOpen,
  onClose,
  onInviteSuccess,
}) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('MODERADOR');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailTrimmed = email.trim();
    const nombreTrimmed = nombre.trim();

    if (!emailTrimmed) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (onInviteSuccess) {
        await onInviteSuccess({
          email: emailTrimmed,
          nombre: nombreTrimmed || emailTrimmed.split('@')[0],
          telefono: telefono.trim(),
          rol,
          mensaje: mensaje.trim(),
        });
      }

      await Swal.fire({
        icon: 'success',
        title: 'Invitación enviada',
        text: `Se ha enviado la invitación a ${emailTrimmed} con el rol de ${rol}.`,
        confirmButtonColor: '#0f172a',
      });

      // Limpiar formulario y cerrar
      setNombre('');
      setEmail('');
      setTelefono('');
      setRol('MODERADOR');
      setMensaje('');
      onClose();
    } catch (err) {
      setError(err?.message || 'No fue posible enviar la invitación.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel lateral derecho */}
      <div
        className="relative z-50 w-full sm:w-[500px] md:w-[540px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Cabecera del drawer */}
          <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight">
                  Invitar Trabajador
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Vincular un nuevo integrante al equipo institucional
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Formulario */}
          <form id="invite-worker-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                {error}
              </div>
            )}

            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombre del Colaborador
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos Silva"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@eventhive.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="3001234567"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                />
              </div>
            </div>

            {/* Selección de Rol Requerido */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Rol a Asignar <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none bg-white font-bold"
                >
                  <option value="MODERADOR">MODERADOR (Revisión y supervisión de eventos)</option>
                  <option value="MARKETING">MARKETING (Gestión de banners y promociones)</option>
                  <option value="ADMINISTRADOR">ADMINISTRADOR (Gestión general del sistema)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                El invitado obtendrá acceso y permisos de dashboard según el rol seleccionado.
              </p>
            </div>

            {/* Mensaje adicional opcional */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mensaje Institucional (Opcional)
              </label>
              <textarea
                rows={3}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Te invitamos a ser parte del equipo operativo de EventHive..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none resize-none"
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
            form="invite-worker-form"
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send size={14} />
            <span>{loading ? 'Enviando...' : 'Enviar Invitación'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
