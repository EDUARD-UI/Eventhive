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
  AlertCircle,
  UserMinus,
  Loader2,
  ShieldAlert,
  Edit3,
  Save,
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';
import adminService from '../../features/admin/services/adminService.js';
import { formatFecha, formatFechaHora } from '../../utils/formatters.js';

export default function ModalDetalleUsuarioAdmin({
  usuario,
  onClose,
  onUserUpdated,
}) {
  if (!usuario) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [editForm, setEditForm] = useState({
    nombre: usuario.nombre || usuario.name || '',
    telefono: usuario.telefono || '',
  });

  const [currentRoles, setCurrentRoles] = useState(() => {
    if (Array.isArray(usuario.roles)) return usuario.roles;
    if (usuario.rolNombre) return [usuario.rolNombre];
    if (usuario.rol) return [usuario.rol];
    return ['CLIENTE'];
  });

  const orgName =
    typeof usuario.organizacion === 'object' && usuario.organizacion !== null
      ? usuario.organizacion.razonSocial || usuario.organizacion.nombre
      : typeof usuario.organizacion === 'string' && usuario.organizacion.trim()
      ? usuario.organizacion
      : null;

  const userPhoto =
    usuario.fotoPerfil ||
    usuario.fotoUrl ||
    usuario.avatarUrl ||
    usuario.imagenUrl ||
    usuario.foto;

  const hasMarketingRole = currentRoles.some(
    (r) => String(r).toUpperCase() === 'MARKETING'
  );

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editForm.nombre.trim()) {
      setErrorMsg('El nombre del usuario no puede estar vacío.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      await adminService.updateUsuario(usuario.id, {
        nombre: editForm.nombre.trim(),
        telefono: editForm.telefono.trim(),
      });
      setSuccessMsg('Información del usuario actualizada exitosamente.');
      setIsEditing(false);
      if (onUserUpdated) {
        await onUserUpdated();
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Error al actualizar el usuario.');
    } finally {
      setSaving(false);
    }
  };

  const handleRevocarMarketing = async () => {
    try {
      setRevoking(true);
      setErrorMsg(null);
      await adminService.revocarRolMarketing(usuario.id);

      const updated = currentRoles.filter(
        (r) => String(r).toUpperCase() !== 'MARKETING'
      );
      setCurrentRoles(updated.length > 0 ? updated : ['CLIENTE']);
      setShowConfirmRevoke(false);
      setSuccessMsg('Rol de marketing revocado exitosamente.');

      if (onUserUpdated) {
        await onUserUpdated();
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          'No se pudo revocar el rol de marketing.'
      );
    } finally {
      setRevoking(false);
    }
  };

  const getRoleBadgeVariant = (rol) => {
    const r = (rol || '').toUpperCase();
    switch (r) {
      case 'ADMINISTRADOR':
        return 'danger';
      case 'MARKETING':
        return 'accent';
      case 'MODERADOR':
        return 'primary';
      case 'REPRESENTANTE':
        return 'warning';
      case 'OPERADOR':
        return 'info';
      case 'CLIENTE':
      default:
        return 'neutral';
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
        onClick={onClose}
      />

      {/* Drawer lateral derecho (diseño idéntico a Detalle de Evento) */}
      <div
        className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Cabecera del drawer */}
          <div className="bg-[#0B1B3D] p-6 text-white flex items-center justify-between border-b border-white/10 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 min-w-0 pr-10">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={usuario.nombre}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-amber-400 text-xl shrink-0">
                  {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300">
                  Ficha de Usuario
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white truncate mt-1">
                  {isEditing ? editForm.nombre || 'Editando...' : editForm.nombre || usuario.nombre}
                </h3>
                <p className="text-xs text-slate-300 truncate mt-0.5">
                  {usuario.correo || usuario.email || 'Correo no registrado'}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-6 space-y-6">
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Formulario de Edición o Consulta */}
            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Editar Información del Usuario
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={editForm.telefono}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))}
                    className="w-full text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    placeholder="Ej: +57 300 123 4567"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditForm({
                        nombre: usuario.nombre || usuario.name || '',
                        telefono: usuario.telefono || '',
                      });
                      setIsEditing(false);
                    }}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-xs transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Ficha de Información */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{editForm.nombre || usuario.nombre}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentRoles.map((r, i) => (
                          <Badge key={i} variant={getRoleBadgeVariant(r)} size="xs">
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Edit3 size={13} />
                    <span>Editar Registro</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">
                      Correo Electrónico
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                      <Mail size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{usuario.correo || usuario.email || '—'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">
                      Teléfono
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                      <Phone size={14} className="text-slate-400 shrink-0" />
                      <span>{editForm.telefono || usuario.telefono || 'No registrado'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">
                      Organización
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                      <Building2 size={14} className="text-primary shrink-0" />
                      <span className="truncate">{orgName || 'Sin organización vinculada'}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200/80">
                    <span className="text-[11px] text-slate-400 block font-bold uppercase">
                      Estado de Cuenta
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          usuario.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{usuario.activo !== false ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </div>

                  {usuario.fechaCreacion && (
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 sm:col-span-2">
                      <span className="text-[11px] text-slate-400 block font-bold uppercase">
                        Fecha de Registro
                      </span>
                      <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span>{formatFecha(usuario.fechaCreacion)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Revocación de rol de Marketing */}
            {hasMarketingRole && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">
                      Gestión de Rol de Marketing
                    </h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Este usuario tiene asignado el rol de marketing para la gestión de pautas y campañas.
                    </p>
                  </div>
                </div>

                {!showConfirmRevoke ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmRevoke(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
                  >
                    <UserMinus size={14} />
                    <span>Revocar Rol de Marketing</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2.5">
                    <p className="text-xs font-bold text-rose-900">
                      ¿Confirmas que deseas revocar el rol de Marketing a {usuario.nombre}?
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowConfirmRevoke(false)}
                        disabled={revoking}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleRevocarMarketing}
                        disabled={revoking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {revoking ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Revocando...</span>
                          </>
                        ) : (
                          <span>Sí, revocar rol</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer fijo del drawer */}
        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
