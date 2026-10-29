import React, { useState, useRef } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Upload,
  FileText,
  AlertTriangle,
  XCircle,
  RefreshCw,
  CheckCircle2,
  X,
  Building2,
  Send,
} from 'lucide-react';
import organizationService from '../../services/organizerService.js';
import { sanitizeText, sanitizeEmail } from '../../utils/sanitizer.js';

const ALLOWED_RUT_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_RUT_SIZE = 10 * 1024 * 1024; // 10MB

export default function BannerVerificacionOrganizacion({
  solicitud,
  orgData,
  onRefresh,
}) {
  const [rutFile, setRutFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type, text }
  const [modalReenviar, setModalReenviar] = useState(false);
  const rutInputRef = useRef(null);

  // Formulario de reenvío
  const [razonSocial, setRazonSocial] = useState(
    solicitud?.razonSocial || orgData?.razonSocial || orgData?.nombre || ''
  );
  const [nit, setNit] = useState(solicitud?.nit || orgData?.nit || '');
  const [correoEmpresarial, setCorreoEmpresarial] = useState(
    solicitud?.correoEmpresarial || orgData?.correoEmpresarial || ''
  );
  const [nuevoRutFile, setNuevoRutFile] = useState(null);

  const estado = (solicitud?.estado || orgData?.estado || 'INCOMPLETA').toUpperCase();

  const handleRutChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_RUT_TYPES.includes(file.type)) {
      setFeedback({
        type: 'error',
        text: 'Formato no permitido. Sube un documento PDF o imagen JPG/PNG.',
      });
      return;
    }
    if (file.size > MAX_RUT_SIZE) {
      setFeedback({
        type: 'error',
        text: 'El documento supera el límite máximo de 10 MB.',
      });
      return;
    }

    setFeedback(null);
    setRutFile(file);
  };

  const handleSubirRut = async () => {
    if (!rutFile) return;
    try {
      setUploading(true);
      setFeedback(null);

      const fd = new FormData();
      fd.append('rut', rutFile);

      if (solicitud?.id) {
        await organizationService.subirRut(solicitud.id, fd);
      } else {
        await organizationService.solicitarVerificacion(fd);
      }

      setFeedback({
        type: 'success',
        text: 'Documento RUT cargado exitosamente. Tu solicitud ahora está en revisión administrativa.',
      });
      setRutFile(null);
      if (rutInputRef.current) rutInputRef.current.value = '';
      if (onRefresh) await onRefresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Error al cargar el RUT. Intenta nuevamente.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReenviarSolicitud = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      setFeedback(null);

      const datosJson = {
        razonSocial: sanitizeText(razonSocial),
        nit: sanitizeText(nit),
        correoEmpresarial: sanitizeEmail(correoEmpresarial),
      };

      const fd = new FormData();
      fd.append(
        'datos',
        new Blob([JSON.stringify(datosJson)], { type: 'application/json' })
      );
      if (nuevoRutFile) {
        fd.append('rut', nuevoRutFile);
      }

      await organizationService.reenviarSolicitudVerificacion(solicitud.id, fd);

      setFeedback({
        type: 'success',
        text: 'Solicitud reenviada con éxito a revisión administrativa.',
      });
      setModalReenviar(false);
      if (onRefresh) await onRefresh();
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err?.message || 'Error al reenviar la solicitud.',
      });
    } finally {
      setUploading(false);
    }
  };

  // Si la organización ya está aprobada, mostrar una insignia compacta
  if (estado === 'APROBADA') {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Organización Oficial Verificada — Habilitada para publicar eventos</span>
        </div>
        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100/70 dark:bg-emerald-900/40 px-2.5 py-0.5 rounded-full">
          NIT: {solicitud?.nit || orgData?.nit || 'Validado'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <XCircle size={15} className="text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700 ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* CASO 1: INCOMPLETA / FALTA SUBIR RUT */}
      {(estado === 'INCOMPLETA' || !solicitud || estado === 'PENDIENTE_REVISION') &&
        estado !== 'PENDIENTE' &&
        estado !== 'CORRECCION_SOLICITADA' &&
        estado !== 'RECHAZADA' && (
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/25 border border-amber-300 dark:border-amber-700/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-950">
                    Paso Obligatorio
                  </span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Verificación Institucional
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Adjunta el RUT para habilitar la publicación de eventos
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                  Tu organización se encuentra en pre-registro. Para que tus eventos puedan ser enviados a moderación y comercializar boletos, la administración requiere validar tu RUT (PDF o imagen, máx 10 MB).
                </p>
              </div>
            </div>

            {/* Input para cargar archivo RUT */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
              <input
                ref={rutInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleRutChange}
                className="hidden"
                id="rut-banner-input"
              />

              <label
                htmlFor="rut-banner-input"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Upload size={14} />
                <span className="truncate max-w-[150px]">
                  {rutFile ? rutFile.name : 'Seleccionar RUT'}
                </span>
              </label>

              {rutFile && (
                <button
                  type="button"
                  onClick={handleSubirRut}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-950 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95"
                >
                  {uploading ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>{uploading ? 'Cargando...' : 'Enviar a Revisión'}</span>
                </button>
              )}
            </div>
          </div>
        )}

      {/* CASO 2: PENDIENTE EN REVISIÓN */}
      {estado === 'PENDIENTE' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                  En cola de revisión
                </span>
                <span className="text-xs text-slate-400">
                  Solicitud #{solicitud?.id || '—'}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-white">
                Verificación de RUT en proceso de auditoría
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mt-0.5">
                Hemos recibido tu documento tributario. El equipo administrativo está validando la razón social y el NIT. Los eventos que crees quedarán guardados en borrador hasta la aprobación.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Consultar Estado</span>
          </button>
        </div>
      )}

      {/* CASO 3: CORRECCION SOLICITADA */}
      {estado === 'CORRECCION_SOLICITADA' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-200 text-amber-950">
                Acción Requerida
              </span>
              <h3 className="font-extrabold text-base text-amber-950 dark:text-amber-100">
                El administrador solicitó correcciones para tu verificación
              </h3>
              {solicitud?.motivoRechazo || solicitud?.mensaje ? (
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-800/60 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  "{solicitud.motivoRechazo || solicitud.mensaje}"
                </div>
              ) : null}
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Por favor subsana los puntos indicados y reenvía los datos o adjunta un nuevo RUT.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalReenviar(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Corregir y Reenviar</span>
          </button>
        </div>
      )}

      {/* CASO 4: RECHAZADA */}
      {estado === 'RECHAZADA' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 flex items-center justify-center shrink-0">
              <XCircle size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-200 text-rose-950">
                Organización Suspendida
              </span>
              <h3 className="font-extrabold text-base text-rose-950 dark:text-rose-100">
                Solicitud de Verificación Rechazada
              </h3>
              {solicitud?.motivoRechazo && (
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/60 text-xs text-slate-800 dark:text-slate-200 font-medium">
                  Motivo: "{solicitud.motivoRechazo}"
                </div>
              )}
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Tu organización no puede enviar eventos a moderación en este estado. Puedes subsanar los motivos y solicitar una reconsideración.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setModalReenviar(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw size={13} />
            <span>Reenviar Documentación</span>
          </button>
        </div>
      )}

      {/* MODAL PARA CORREGIR Y REENVIAR DATOS */}
      {modalReenviar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Corregir y Reenviar Verificación
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actualiza los datos fiscales y/o adjunta un nuevo documento RUT
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalReenviar(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReenviarSolicitud} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Razón Social <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={razonSocial}
                  onChange={(e) => setRazonSocial(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    NIT <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Correo Empresarial <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={correoEmpresarial}
                    onChange={(e) => setCorreoEmpresarial(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Nuevo RUT (Opcional si ya subiste el correcto)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setNuevoRutFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalReenviar(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                >
                  {uploading ? 'Reenviando...' : 'Reenviar a Auditoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

