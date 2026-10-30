import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import {
  X,
  Building2,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Star,
  ShieldCheck,
  FileText,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';
import Swal from 'sweetalert2';
import adminService from '../../features/admin/services/adminService.js';
import { formatFecha } from '../../utils/formatters.js';

export default function ModalPerfilOrganizacionAdmin({
  organizacion,
  onClose,
  onAprobarVerificacion,
  onRechazarVerificacion,
}) {
  const [loadingRut, setLoadingRut] = useState(false);

  if (!organizacion) return null;

  // Consulta segura del archivo RUT para administradores autorizados (Requerimiento 7.2)
  const handleVerRut = async () => {
    setLoadingRut(true);
    try {
      const res = await adminService.getRutUrl(organizacion.id);
      const url = res?.rutUrl || res?.data?.rutUrl || res?.url;
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Documento no disponible',
          text: 'Esta organización no tiene un documento RUT activo o disponible para consulta.',
          confirmButtonColor: '#0B1B3D',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error de consulta',
        text: err?.message || 'No se pudo obtener el acceso seguro al documento RUT.',
        confirmButtonColor: '#0B1B3D',
      });
    } finally {
      setLoadingRut(false);
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
        className="relative z-50 w-full sm:w-[620px] md:w-[680px] lg:w-[740px] bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1B3D] text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-amber-400 flex items-center justify-center shrink-0 overflow-hidden">
              {organizacion.avatar || organizacion.logo || organizacion.urlLogo ? (
                <img
                  src={organizacion.avatar || organizacion.logo || organizacion.urlLogo}
                  alt={organizacion.nombre || organizacion.razonSocial}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-7 h-7" strokeWidth={1.75} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300">
                  Organización
                </span>
                <Badge tone={organizacion.estado === 'APROBADA' || organizacion.estado === 'VERIFICADA' ? 'active' : 'warning'}>
                  {organizacion.estado || 'REGISTRADA'}
                </Badge>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                {organizacion.nombre || organizacion.razonSocial || 'Organización'}
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                NIT: <strong className="text-white">{organizacion.nit || 'En verificación'}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* 1. Métricas Agregadas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Actividad de la Organización
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-slate-900">
                  {organizacion.eventosActivos ?? organizacion.cantidadEventos ?? organizacion.eventsCount ?? 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Eventos Activos</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-amber-600 flex items-center justify-center gap-1">
                  <span>{organizacion.valoracionPromedio || organizacion.rating || '—'}</span>
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {organizacion.totalValoraciones || 0} valoraciones
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-brand">
                  {organizacion.totalSeguidores || organizacion.followers || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Seguidores</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-emerald-600">
                  {organizacion.estado === 'APROBADA' || organizacion.estado === 'VERIFICADA' ? 'Activa' : 'Revisión'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Estado</p>
              </div>
            </div>
          </div>

          {/* 2. Datos Administrativos y Representante Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Datos del Representante Legal
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
              <p>
                <span className="text-slate-400 block text-[11px]">Razón Social Completa:</span>
                <strong className="text-slate-900">{organizacion.razonSocial || organizacion.name}</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <p className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
                  <span>Representante: <strong className="text-slate-900">{organizacion.representanteLegal || organizacion.representanteNombre || organizacion.representante || '—'}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{organizacion.correoContacto || organizacion.email || organizacion.correo || '—'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>{organizacion.telefono || 'Sin teléfono registrado'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Registrada el: <strong>{organizacion.fechaCreacion || organizacion.fechaRegistro ? formatFecha(organizacion.fechaCreacion || organizacion.fechaRegistro) : '—'}</strong></span>
                </p>
              </div>
            </div>
          </div>

          {/* 3. Documento Privado RUT (Acceso Seguro) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Documento Privado RUT
              </h4>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" strokeWidth={2} />
                Documento Privado
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-brand">
                  <FileText className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Registro Único Tributario (RUT)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Consulta segura mediante URL temporal autorizada
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerRut}
                disabled={loadingRut}
                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
              >
                {loadingRut ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Consultando...</span>
                  </>
                ) : (
                  <>
                    <span>Consultar RUT</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Acciones de Validación Implementadas */}
          {organizacion.solicitudId && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Acciones de Verificación del RUT</h4>
              <div className="flex items-center gap-2">
                {onAprobarVerificacion && (
                  <button
                    type="button"
                    onClick={() => onAprobarVerificacion(organizacion.solicitudId)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aprobar RUT</span>
                  </button>
                )}
                {onRechazarVerificacion && (
                  <button
                    type="button"
                    onClick={() => onRechazarVerificacion(organizacion.solicitudId)}
                    className="py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Rechazar RUT</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer del Modal */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
