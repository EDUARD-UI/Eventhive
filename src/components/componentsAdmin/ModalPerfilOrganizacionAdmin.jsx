import { createPortal } from 'react-dom';
import React from 'react';
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
  Ban,
  CheckCircle2,
} from 'lucide-react';
import Badge from '../Shared/Badge.jsx';
import Swal from 'sweetalert2';

export default function ModalPerfilOrganizacionAdmin({
  organizacion,
  onClose,
  onSuspender,
  onReactivar,
}) {
  if (!organizacion) return null;

  const isSuspendida = organizacion.estado === 'SUSPENDIDA';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto no-scrollbar animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-950 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#087fea]/20 border border-[#087fea]/30 text-sky-400 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7" strokeWidth={1.75} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-amber-300">
                  Perfil de Gestión Administrativa
                </span>
                <Badge tone={isSuspendida ? 'red' : organizacion.estado === 'APROBADA' ? 'green' : 'amber'}>
                  {organizacion.estado}
                </Badge>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-white leading-tight truncate">
                {organizacion.nombreComercial || organizacion.razonSocial}
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                NIT: <strong className="text-white">{organizacion.nit}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              1. Métricas Agregadas de Reputación y Actividad
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-slate-900">
                  {organizacion.cantidadEventos || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Eventos Totales</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-amber-600 flex items-center justify-center gap-1">
                  <span>{organizacion.valoracionPromedio || '0.0'}</span>
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {organizacion.totalValoraciones || 0} valoraciones
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-[#087fea]">
                  {organizacion.totalSeguidores || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Seguidores</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xl font-display font-extrabold text-emerald-600">
                  {organizacion.operadoresCount || 1}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Operadores Activos</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              2. Datos Administrativos y Representación Legal
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs text-slate-700">
              <p>
                <span className="text-slate-400 block text-[11px]">Razón Social Completa:</span>
                <strong className="text-slate-900">{organizacion.razonSocial}</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60">
                <p className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" strokeWidth={1.75} />
                  <span>Representante: <strong className="text-slate-900">{organizacion.representanteNombre || organizacion.representante}</strong></span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#087fea] shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{organizacion.correo}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={1.75} />
                  <span>{organizacion.telefono || 'Sin teléfono'}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Registrada el: <strong>{organizacion.fechaRegistro}</strong></span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Documentos Privados y Sensibles (Acceso Autorizado)
              </h4>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" strokeWidth={2} />
                No visible en perfil público
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#087fea]">
                  <FileText className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Documento Tributario RUT (DIAN)
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {organizacion.rutPrivado?.nombre || 'RUT_EMPRESARIAL_PROTEGIDO.pdf'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  Swal.fire({
                    icon: 'info',
                    title: 'Documento Tributario RUT',
                    text: 'Abriendo visor seguro del documento RUT privado...',
                    timer: 2000,
                    showConfirmButton: false,
                  })
                }
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-[#087fea] hover:text-white text-slate-700 text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver RUT</span>
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {isSuspendida && organizacion.motivoSuspension && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              <strong className="block text-rose-900 font-bold mb-0.5">Motivo de Suspensión Administrativa:</strong>
              {organizacion.motivoSuspension}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cerrar
            </button>

            <div className="flex items-center gap-2">
              {isSuspendida ? (
                <button
                  type="button"
                  onClick={() => {
                    onReactivar(organizacion.id);
                    onClose();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all inline-flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>Reactivar Organización</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuspender(organizacion);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <Ban className="w-4 h-4" strokeWidth={1.75} />
                  <span>Suspender Organización</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
