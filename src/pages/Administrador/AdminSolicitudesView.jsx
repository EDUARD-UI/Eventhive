import adminService from '../../features/admin/services/adminService.js';
import { formatFecha, formatFechaHora } from '../../utils/formatters.js';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  AlertTriangle,
  XCircle,
  FileText,
  Mail,
  User,
  Check,
  X,
  Edit3,
  Eye,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';
import { showInfoAlert, showWarningAlert } from '../../utils/alertUtils.js';

export default function AdminSolicitudesView({
  solicitudes = [],
  loading = false,
  onAprobar,
  onRechazar,
  onSolicitarCorreccion,
  onVerDetalle,
}) {
  const [modalAccion, setModalAccion] = useState(null);
  const [viewingRutId, setViewingRutId] = useState(null); // { solicitud, tipo: 'aprobar' | 'correccion' | 'rechazar' }
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpenAccion = (solicitud, tipo) => {
    setModalAccion({ solicitud, tipo });
    setMotivo('');
    setError('');
  };

  const handleConfirmAccion = async (e) => {
    e.preventDefault();
    if (modalAccion.tipo !== 'aprobar' && !motivo.trim()) {
      setError('Debes ingresar un motivo o justificación para la organización.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      if (modalAccion.tipo === 'aprobar') {
        await onAprobar(modalAccion.solicitud.id);
      } else if (modalAccion.tipo === 'correccion') {
        await onSolicitarCorreccion(modalAccion.solicitud.id, motivo.trim());
      } else if (modalAccion.tipo === 'rechazar') {
        await onRechazar(modalAccion.solicitud.id, motivo.trim());
      }
      setModalAccion(null);
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Lista de Solicitudes de Verificación Pendientes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Solicitudes de Verificación Pendientes
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {solicitudes.length} en cola
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organizaciones con documento tributario cargado en espera de verificación
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 rounded-2xl bg-slate-100/70 border border-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2.5" size={36} />
            <h4 className="font-display text-sm font-bold text-slate-800">
              ¡Sin solicitudes pendientes!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Todas las organizaciones registradas han sido validadas o se encuentran en pre-registro sin documento pendiente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5"
              >
                {/* Datos de la Organización */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                      Solicitud de Registro
                    </span>
                    <Badge variant="warning" size="xs">
                      {sol.estado || 'PENDIENTE'}
                    </Badge>
                    {sol.mensaje && (
                      <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                        "{sol.mensaje}"
                      </span>
                    )}
                  </div>

                  <h4 className="font-display text-base font-bold text-slate-900 truncate">
                    {sol.razonSocial || sol.nombre || 'Organización'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>NIT: <strong className="font-mono text-slate-800">{sol.nit || 'En verificación'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Rep: <strong className="text-slate-800">{sol.representanteNombre || sol.representante || '—'}</strong></span>
                    </div>

                    {sol.correoEmpresarial && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{sol.correoEmpresarial}</span>
                      </div>
                    )}

                    {sol.fechaSolicitud && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Enviado: {formatFecha(sol.fechaSolicitud)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Verificación con Jerarquía y Colores Claramente Diferenciados */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end xl:self-center pt-2 xl:pt-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const rutWindow = window.open('about:blank', '_blank');
                      if (!rutWindow) {
                        await showWarningAlert(
                          'Ventana emergente bloqueada',
                          'Permite las ventanas emergentes para consultar el documento RUT.'
                        );
                        return;
                      }
                      rutWindow.opener = null;
                      try {
                        const targetOrgId = sol.organizacionId || sol.id;
                        setViewingRutId(targetOrgId);
                        const res = await adminService.getRutUrl(targetOrgId);
                        const url = res?.rutUrl || res?.data?.rutUrl || res?.url;
                        if (url) {
                          rutWindow.location.href = url;
                        } else {
                          rutWindow.close();
                          await showInfoAlert('Documento no disponible', 'El documento RUT aún no tiene una URL activa.');
                        }
                      } catch (err) {
                        rutWindow.close();
                        await showInfoAlert('No fue posible abrir el RUT', err?.message || 'Ocurrió un error al consultar el documento.');
                      } finally {
                        setViewingRutId(null);
                      }
                    }}
                    disabled={viewingRutId === (sol.organizacionId || sol.id)}
                    className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Consultar archivo RUT oficial cargado"
                  >
                    <FileText size={14} className="text-amber-500" />
                    <span>{viewingRutId === (sol.organizacionId || sol.id) ? 'Abriendo...' : 'Ver RUT'}</span>
                  </button>

                  {onVerDetalle && (
                    <button
                      type="button"
                      onClick={() => onVerDetalle(sol)}
                      className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      title="Ver información completa de la organización"
                    >
                      <Eye size={14} className="text-slate-500" />
                      <span>Ver Detalle</span>
                    </button>
                  )}

                  {/* 1. Solicitar Corrección (Revisar) - Ámbar */}
                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'correccion')}
                    className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-800 border border-amber-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                    title="Solicitar subsanación de documentos o información"
                  >
                    <Edit3 size={14} className="text-amber-700" />
                    <span>Solicitar Corrección</span>
                  </button>

                  {/* 2. Rechazar - Rosa/Rojo suave */}
                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'rechazar')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100/90 text-rose-700 border border-rose-300 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                    title="Rechazar la solicitud de verificación"
                  >
                    <X size={14} className="text-rose-600" />
                    <span>Rechazar</span>
                  </button>

                  {/* 3. Aprobar / Verificar Organización - Verde Esmeralda Sólido */}
                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'aprobar')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm ring-1 ring-emerald-500 transition-all active:scale-95 flex items-center gap-1.5"
                    title="Aprobar y habilitar la organización para publicar eventos"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>Aprobar Verificación</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Acción */}
      {modalAccion && (
        createPortal(<div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setModalAccion(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    modalAccion.tipo === 'aprobar'
                      ? 'bg-emerald-50 text-emerald-600'
                      : modalAccion.tipo === 'correccion'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {modalAccion.tipo === 'aprobar' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : modalAccion.tipo === 'correccion' ? (
                    <Edit3 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {modalAccion.tipo === 'aprobar'
                      ? 'Aprobar Verificación de Organización'
                      : modalAccion.tipo === 'correccion'
                      ? 'Solicitar Correcciones de RUT'
                      : 'Rechazar Solicitud de Verificación'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {modalAccion.solicitud.razonSocial || modalAccion.solicitud.nombre}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmAccion} className="p-6 space-y-4">
              {modalAccion.tipo === 'aprobar' ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 leading-relaxed">
                  Al aprobar la verificación, la organización quedará formalmente habilitada para publicar eventos, configurar localidades y comercializar boletos en EventHive.
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo / Justificación obligatoria <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder={
                      modalAccion.tipo === 'correccion'
                        ? 'Indica las inconsistencias en el RUT o datos que la organización debe subsanar...'
                        : 'Explica el motivo del rechazo definitivo de la solicitud...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Este mensaje será notificado al representante legal de la organización.
                  </p>
                </div>
              )}

              {error && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAccion(null)}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                    modalAccion.tipo === 'aprobar'
                      ? 'bg-emerald-600 hover:bg-emerald-700 ring-1 ring-emerald-500'
                      : modalAccion.tipo === 'correccion'
                      ? 'bg-amber-600 hover:bg-amber-700 ring-1 ring-amber-500'
                      : 'bg-rose-600 hover:bg-rose-700 ring-1 ring-rose-500'
                  }`}
                >
                  {actionLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Procesando...
                    </span>
                  ) : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body)
      )}
    </div>
  );
}
