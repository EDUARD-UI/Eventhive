import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCircle2,
  Shield,
  UserCheck,
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';
import { formatFecha } from '../../utils/formatters.js';

export default function ModalDetalleUsuarioAdmin({ usuario, onClose }) {
  if (!usuario) return null;

  const roles = (() => {
    if (Array.isArray(usuario.roles) && usuario.roles.length > 0) {
      return usuario.roles.map((r) =>
        typeof r === 'object' && r !== null ? r.nombre || r.name || '' : String(r)
      );
    }
    if (usuario.rolNombre) return [usuario.rolNombre];
    if (usuario.rol) return [usuario.rol];
    return ['CLIENTE'];
  })();

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

  const userEmail = usuario.correo || usuario.email || 'Sin correo registrado';
  const userName = usuario.nombre || usuario.name || 'Usuario';
  const userPhone = usuario.telefono || usuario.phone || 'Sin teléfono registrado';
  const isActivo = usuario.activo !== false && (usuario.estado || '').toUpperCase() !== 'INACTIVO';
  const fechaReg = usuario.fechaRegistro || usuario.fechaCreacion || usuario.createdAt;

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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera Estilo Mobile Hero */}
        <div className="bg-[#0B1B3D] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/80 shadow-md mb-3"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-amber-400/80 text-amber-300 font-extrabold text-2xl flex items-center justify-center shadow-md mb-3">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}

            <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">
              {userName}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 truncate max-w-full">
              {userEmail}
            </p>

            {/* Badges de Roles */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5">
              {roles.map((r, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Cuerpo con Fichas de Datos */}
        <div className="p-5 space-y-3 overflow-y-auto text-xs flex-1">
          {/* Teléfono */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand flex items-center justify-center shrink-0">
              <Phone size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Teléfono</p>
              <p className="font-semibold text-slate-800 truncate">{userPhone}</p>
            </div>
          </div>

          {/* Organización */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase text-slate-400">Organización Vinculada</p>
              <p className="font-semibold text-slate-800 truncate">
                {orgName || 'Sin organización vinculada'}
              </p>
            </div>
          </div>

          {/* Estado de cuenta */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={15} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Estado de Cuenta</p>
                <p className="font-semibold text-slate-800">
                  {isActivo ? 'Cuenta activa' : 'Cuenta inactiva'}
                </p>
              </div>
            </div>
            <Badge variant={isActivo ? 'success' : 'danger'} size="xs">
              {isActivo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {/* Fecha de Registro si existe */}
          {fechaReg && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Fecha de Registro</p>
                <p className="font-semibold text-slate-800 truncate">{formatFecha(fechaReg)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
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
