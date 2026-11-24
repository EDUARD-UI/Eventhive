import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Building2,
  Calendar,
  User,
  Check,
  X,
  Edit3,
  Eye,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import adminService from '../../features/admin/services/adminService.js';
import { formatFecha } from '../../utils/formatters.js';
import { showInfoAlert, showWarningAlert } from '../../utils/alertUtils.js';

export default function AdminSolicitudesView({
  solicitudes = [],
  loading = false,
  onAprobar,
  onRechazar,
  onSolicitarCorreccion,
  onVerDetalle,
}) {
  const solicitudesPendientes = (solicitudes || []).filter(
    (s) => s.estado !== 'APROBADA' && s.estadoOrganizacion !== 'APROBADA'
  );

  const [modalAccion, setModalAccion] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Drawer de vista rápida del documento RUT
  const [rutDrawer, setRutDrawer] = useState(null); // { url: string, razonSocial: string, loading: boolean }

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

  const handleOpenRutDrawer = async (sol) => {
    setRutDrawer({
      loading: true,
      url: null,
      razonSocial: sol.razonSocial || sol.nombre || 'Organización',
      solicitudId: sol.id,
    });

    try {
      const res = await adminService.getSolicitudRut(sol.id);
      const url =
        res?.urlRutTemporal ||
        res?.urlRut ||
        res?.rutUrl ||
        res?.url ||
        res?.data?.urlRutTemporal ||
        res?.data?.urlRut ||
        res?.data?.rutUrl;

      if (url) {
        setRutDrawer({
          loading: false,
          url,
          razonSocial: sol.razonSocial || sol.nombre || 'Organización',
          solicitudId: sol.id,
        });
      } else {
        setRutDrawer(null);
        await showInfoAlert('Documento no disponible', 'El documento RUT no tiene un archivo digital activo.');
      }
    } catch (err) {
      setRutDrawer(null);
      await showInfoAlert('Error al cargar documento', err?.message || 'No fue posible consultar el archivo RUT.');
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-300">
      {/* 1. Encabezado Editorial */}
      <div className="border-b border-[#E2E8F0] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-[clamp(1.5rem,4vw,2.25rem)] text-[#0F2342] tracking-tight uppercase leading-none">
            VALIDAR RUT · EXPEDIENTES FISCALES
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#64748B] mt-2">
            Revisión y dictamen de documentos tributarios de organizaciones postuladas.
          </p>
        </div>

        <div className="font-mono text-xs uppercase tracking-wider text-[#64748B]">
          <span>Expedientes en cola: </span>
          <strong className="text-[#0F2342] font-bold">{solicitudesPendientes.length}</strong>
        </div>
      </div>

      {/* 2. Listado de Expedientes Fiscales Horizontales */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-[2px] bg-[#FFFFFF] border border-[#E2E8F0] p-6 animate-pulse"
            />
          ))}
        </div>
      ) : solicitudesPendientes.length === 0 ? (
        <div className="p-12 rounded-[2px] border border-dashed border-[#CBD5E1] bg-[#FFFFFF] text-center font-mono text-xs text-[#64748B]">
          <p className="font-bold text-[#0F2342] uppercase tracking-wider text-sm">
            [ BANDEJA AL DÍA · CERO SOLICITUDES PENDIENTES ]
          </p>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Todas las organizaciones registradas cuentan con resolución fiscal emitida.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {solicitudesPendientes.map((sol) => (
            <div
              key={sol.id}
              className="bg-[#FFFFFF] border border-[#E2E8F0] border-l-4 border-l-[#F5B800] rounded-[2px] p-5 sm:p-6 shadow-2xs hover:border-[#0F2342]/40 transition-all flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5"
            >
              {/* Bloque Izquierdo: Datos de la Organización */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base sm:text-lg text-[#0F2342] uppercase tracking-tight truncate">
                    {sol.razonSocial || sol.nombre || 'Organización'}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#B45309] font-bold bg-[#F5B800]/15 px-1.5 py-0.5 rounded-[1px]">
                    EN REVISIÓN
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs text-[#64748B]">
                  <div>
                    NIT: <strong className="text-[#0F2342]">{sol.nit || 'En verificación'}</strong>
                  </div>
                  <div>
                    Representante:{' '}
                    <strong className="text-[#0F2342]">
                      {sol.representanteNombre || sol.representante || '—'}
                    </strong>
                  </div>
                  {sol.fechaSolicitud && (
                    <div>
                      Enviado: <strong className="text-[#0F2342]">{formatFecha(sol.fechaSolicitud)}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Bloque Centro: Vista Rápida de Documento RUT */}
              <div className="shrink-0 flex items-center">
                <button
                  type="button"
                  onClick={() => handleOpenRutDrawer(sol)}
                  className="px-4 py-2.5 rounded-[2px] border border-[#0F2342] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
                >
                  <FileText size={14} className="text-[#0F2342]" />
                  <span>VER DOCUMENTO RUT</span>
                </button>
              </div>

              {/* Bloque Derecho: Botones de Dictamen Rectangulares (border-radius: 2px) */}
              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-[#F1F5F9]">
                {onVerDetalle && (
                  <button
                    type="button"
                    onClick={() => onVerDetalle(sol)}
                    className="px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8F9FA] text-[#0F2342] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Eye size={13} />
                    <span>Revisar Detalle</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenAccion(sol, 'correccion')}
                  className="px-3.5 py-2.5 rounded-[2px] border border-[#F5B800] bg-[#FFFFFF] hover:bg-amber-50 text-[#B45309] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 size={13} />
                  <span>Solicitar Corrección</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAccion(sol, 'rechazar')}
                  className="px-3.5 py-2.5 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-rose-50 text-[#DC2626] font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <X size={13} />
                  <span>Rechazar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenAccion(sol, 'aprobar')}
                  className="px-4 py-2.5 rounded-[2px] bg-[#0F2342] hover:bg-[#15803D] text-[#FFFFFF] font-mono text-xs uppercase tracking-wider font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={13} strokeWidth={2.5} />
                  <span>Aprobar Verificación</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRAWER DE VISTA RÁPIDA DEL DOCUMENTO RUT */}
      {rutDrawer &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex justify-end">
            <div
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs cursor-pointer transition-opacity"
              onClick={() => setRutDrawer(null)}
            />

            <div
              className="relative z-50 w-full sm:w-[640px] md:w-[720px] bg-[#FFFFFF] h-full shadow-2xl border-l border-[#E2E8F0] overflow-y-auto animate-in slide-in-from-right duration-250 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5 sm:p-6 bg-[#0F2342] text-white">
                  <div>
                    <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                      Expediente Tributario · RUT
                    </h3>
                    <p className="font-mono text-xs text-slate-300 mt-0.5">
                      {rutDrawer.razonSocial}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {rutDrawer.url && (
                      <a
                        href={rutDrawer.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="p-1.5 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Abrir en pestaña nueva"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setRutDrawer(null)}
                      className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  {rutDrawer.loading ? (
                    <div className="h-96 flex flex-col items-center justify-center font-mono text-xs text-[#64748B] gap-2">
                      <RotateCw className="w-6 h-6 animate-spin text-[#0F2342]" />
                      <span>Cargando documento desde el servidor seguro...</span>
                    </div>
                  ) : rutDrawer.url ? (
                    <div className="w-full h-[650px] border border-[#E2E8F0] rounded-[2px] overflow-hidden bg-slate-100">
                      <iframe
                        src={rutDrawer.url}
                        title={`RUT ${rutDrawer.razonSocial}`}
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="p-8 text-center font-mono text-xs text-[#64748B]">
                      No se pudo visualizar el documento.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setRutDrawer(null)}
                  className="px-5 py-2.5 rounded-[2px] bg-[#0F2342] text-white font-mono text-xs uppercase tracking-wider font-bold"
                >
                  Cerrar Visor
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL DE DICTAMEN (CORRECCIÓN / RECHAZO / APROBACIÓN) */}
      {modalAccion &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
            <div
              className="bg-[#FFFFFF] rounded-[2px] max-w-md w-full shadow-2xl border border-[#E2E8F0] overflow-hidden animate-in fade-in duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-[#0F2342] text-white flex items-center justify-between border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-display font-black text-base uppercase tracking-tight text-white">
                    {modalAccion.tipo === 'aprobar'
                      ? 'Confirmar Verificación'
                      : modalAccion.tipo === 'correccion'
                      ? 'Solicitar Subsanación'
                      : 'Rechazar Solicitud'}
                  </h3>
                  <p className="font-mono text-xs text-slate-300 mt-0.5">
                    {modalAccion.solicitud?.razonSocial || 'Organización'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAccion(null)}
                  className="p-1 rounded-[2px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleConfirmAccion} className="p-5 sm:p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-[2px] bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs">
                    {error}
                  </div>
                )}

                {modalAccion.tipo === 'aprobar' ? (
                  <p className="font-mono text-xs text-[#0F2342] leading-relaxed">
                    Al aprobar la verificación, la organización quedará formalmente acreditada para publicar eventos y comercializar boletería en la plataforma.
                  </p>
                ) : (
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-[#0F2342] font-bold mb-1.5">
                      Motivo o Justificación <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder={
                        modalAccion.tipo === 'correccion'
                          ? 'Describe las observaciones que la entidad debe subsanar en su RUT...'
                          : 'Indica la causal oficial de rechazo...'
                      }
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className="w-full p-3 rounded-[2px] border border-[#E2E8F0] bg-[#FFFFFF] text-xs font-mono text-[#0F2342] outline-none focus:border-[#0F2342] transition-colors resize-none leading-relaxed"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalAccion(null)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-[2px] border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8F9FA] font-mono text-xs uppercase tracking-wider font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`px-5 py-2.5 rounded-[2px] font-mono text-xs uppercase tracking-wider font-bold text-white transition-all ${
                      modalAccion.tipo === 'aprobar'
                        ? 'bg-[#15803D] hover:bg-emerald-700'
                        : modalAccion.tipo === 'correccion'
                        ? 'bg-[#B45309] hover:bg-amber-700'
                        : 'bg-[#DC2626] hover:bg-rose-700'
                    }`}
                  >
                    {actionLoading
                      ? 'Procesando...'
                      : modalAccion.tipo === 'aprobar'
                      ? 'Confirmar Aprobación'
                      : modalAccion.tipo === 'correccion'
                      ? 'Emitir Subsanación'
                      : 'Confirmar Rechazo'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
