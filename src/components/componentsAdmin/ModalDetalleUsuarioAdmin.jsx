import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Building2,
  Calendar,
  CheckCircle2,
  Send,
  Save,
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';

export default function ModalDetalleUsuarioAdmin({
  usuario,
  onClose,
  onSave,
  onOpenSendMail,
}) {
  if (!usuario) return null;

  const [nombre, setNombre] = useState(usuario.nombre || '');
  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [rol, setRol] = useState(
    usuario.rolNombre || usuario.rol || 'CLIENTE'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const orgName =
    typeof usuario.organizacion === 'object' && usuario.organizacion !== null
      ? usuario.organizacion.razonSocial || usuario.organizacion.nombre
      : typeof usuario.organizacion === 'string' && usuario.organizacion.trim()
      ? usuario.organizacion
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      if (onSave) {
        await onSave({
          id: usuario.id,
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          rolNombre: rol,
          rol,
        });
      }
      setSuccessMsg('Información de usuario actualizada correctamente.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err?.message || 'Error al actualizar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer lateral derecho */}
      <div
        className="relative z-50 w-full sm:w-[500px] md:w-[560px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Cabecera del drawer */}
          <div className="bg-[#131b2e] p-6 text-white flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-amber-400 text-lg shrink-0">
                {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Perfil de Usuario #{usuario.id}
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white truncate leading-tight">
                  {usuario.nombre}
                </h3>
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

          {/* Contenido del drawer */}
          <div className="p-6 space-y-6">
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800">
                {errorMsg}
              </div>
            )}

            {/* Ficha Resumen de Datos de Contacto */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Correo Electrónico:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {usuario.correo || usuario.email || 'No registrado'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Organización:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary" />
                  {orgName || 'Sin organización vinculada'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Rol Actual:</span>
                <Badge variant="primary" size="xs">
                  {usuario.rolNombre || usuario.rol || 'CLIENTE'}
                </Badge>
              </div>

              {/* Botón de Envío Individual de Correo */}
              {onOpenSendMail && (
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenSendMail({
                        email: usuario.correo || usuario.email || '',
                        name: usuario.nombre || '',
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    <Send size={12} />
                    <span>Enviar Correo Individual</span>
                  </button>
                </div>
              )}
            </div>

            {/* Formulario de Edición de Usuario */}
            <form id="user-drawer-form" onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Editar Datos y Permisos
              </h4>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Rol Asignado en Plataforma *
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#087fea] focus:ring-2 focus:ring-[#087fea]/10 text-xs sm:text-sm text-slate-800 transition-all outline-none bg-white"
                  >
                    <option value="CLIENTE">CLIENTE</option>
                    <option value="OPERADOR">OPERADOR</option>
                    <option value="REPRESENTANTE">REPRESENTANTE</option>
                    <option value="MARKETING">MARKETING</option>
                    <option value="MODERADOR">MODERADOR</option>
                    <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Modificar el rol altera los accesos y paneles disponibles para esta cuenta.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer fijo del drawer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            form="user-drawer-form"
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
