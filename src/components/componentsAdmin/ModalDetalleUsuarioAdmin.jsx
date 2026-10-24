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
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';
import adminService from '../../features/admin/services/adminService.js';

export default function ModalDetalleUsuarioAdmin({
  usuario,
  onClose,
  onUserUpdated,
}) {
  if (!usuario) return null;

  const [revoking, setRevoking] = useState(false);
  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
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

  // Verificar si el usuario tiene rol MARKETING
  const hasMarketingRole = currentRoles.some(
    (r) => String(r).toUpperCase() === 'MARKETING'
  );

  const handleRevocarMarketing = async () => {
    try {
      setRevoking(true);
      setErrorMsg(null);
      await adminService.revocarRolMarketing(usuario.id);

      // Actualizar roles locales tras confirmación exitosa del backend
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
          'No se pudo revocar el rol de marketing. Verifique sus permisos de administrador.'
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
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={usuario.nombre}
                  className="w-12 h-12 rounded-2xl object-cover border border-white/20 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-amber-400 text-lg shrink-0">
                  {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Consulta de Usuario
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

          {/* Contenido en modo consulta */}
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

            {/* Ficha Principal de Identidad */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={usuario.nombre}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-2xl shrink-0">
                  {usuario.nombre?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {usuario.nombre}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {usuario.correo || usuario.email || 'Correo no registrado'}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {currentRoles.map((r, i) => (
                    <Badge key={i} variant={getRoleBadgeVariant(r)} size="xs">
                      {r}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Datos detallados de contacto e información */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Información de la Cuenta
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Correo Electrónico
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{usuario.correo || usuario.email || '—'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Teléfono
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{usuario.telefono || 'No registrado'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Organización
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800 truncate">
                    <Building2 size={14} className="text-primary shrink-0" />
                    <span className="truncate">{orgName || 'Sin organización vinculada'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[11px] text-slate-400 block font-medium">
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
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 block font-medium">
                      Fecha de Registro
                    </span>
                    <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-800">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span>{new Date(usuario.fechaCreacion).toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sección exclusiva de Marketing: Revocar rol */}
            {hasMarketingRole && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-amber-900">
                      Gestión de Rol de Marketing
                    </h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Este usuario tiene asignado el rol de marketing para la gestión de pautas y campañas. Si es necesario, puede revocarle este rol administrativo.
                    </p>
                  </div>
                </div>

                {!showConfirmRevoke ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmRevoke(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs"
                  >
                    <UserMinus size={14} />
                    <span>Revocar Rol de Marketing</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-rose-200 space-y-2.5">
                    <p className="text-xs font-bold text-rose-900">
                      ¿Confirmas que deseas revocar el rol de Marketing a {usuario.nombre}?
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Esta acción modificará sus accesos en la plataforma inmediatamente.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowConfirmRevoke(false)}
                        disabled={revoking}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleRevocarMarketing}
                        disabled={revoking}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
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
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Cerrar Consulta
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
