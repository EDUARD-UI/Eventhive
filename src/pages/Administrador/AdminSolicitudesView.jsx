import React, { useState } from 'react';
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
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';

export default function AdminSolicitudesView({
  solicitudes = [],
  loading = false,
  onAprobar,
  onRechazar,
  onSolicitarCorreccion,
  onVerDetalle,
}) {
  const [modalAccion, setModalAccion] = useState(null); // { solicitud, tipo: 'aprobar' | 'correccion' | 'rechazar' }
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
      {/* Alerta de Responsabilidad Oficial (Modulo_Administracion.md & Organizaciones.md) */}
      <div className="p-6 rounded-3xl bg-indigo-50/80 border border-indigo-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-800 shrink-0">
            <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-bold text-indigo-950 mb-1">
              Verificación de Organizaciones (Admisión Administrativa)
            </h3>
            <p className="text-xs text-indigo-900 leading-relaxed max-w-3xl">
              Conforme a la especificación técnica actualizada:
              <em> "El Administrador revisa las solicitudes de verificación de organizaciones tras la carga del RUT. El Moderador no participa en este flujo."</em>
              <br />
              Aquí se validan la razón social, el NIT y los soportes de cada organización antes de habilitarla para publicar eventos en EventHive.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Solicitudes de Verificación Pendientes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Solicitudes de Verificación Pendientes
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {solicitudes.length} en cola
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Organizaciones con RUT cargado en espera de verificación y habilitación
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-slate-100/70 border border-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
            <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
            <h4 className="font-display text-sm font-bold text-slate-800">
              ¡Sin solicitudes pendientes!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Todas las organizaciones registradas han sido verificadas o se encuentran en pre-registro sin RUT pendiente.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Solicitud #{sol.id}
                    </span>
                    <Badge variant="warning" size="xs">
                      {sol.estado || 'PENDIENTE'}
                    </Badge>
                  </div>

                  <h4 className="font-display text-base font-bold text-slate-900 truncate">
                    {sol.razonSocial || sol.nombre || 'Organización'}
                  </h4>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>NIT: <strong>{sol.nit || 'En verificación'}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Rep: {sol.representanteNombre || sol.representante || '—'}</span>
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
                        <span>Enviado: {sol.fechaSolicitud.split('T')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones de Verificación del Administrador */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'correccion')}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Edit3 size={13} />
                    <span>Solicitar Corrección</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'rechazar')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <X size={13} />
                    <span>Rechazar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenAccion(sol, 'aprobar')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>Verificar Organización</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Acción */}
      {modalAccion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setModalAccion(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-display text-base font-bold text-slate-900">
                {modalAccion.tipo === 'aprobar'
                  ? '¿Verificar esta Organización?'
                  : modalAccion.tipo === 'correccion'
                  ? 'Solicitar Correcciones a la Organización'
                  : 'Rechazar Solicitud de Organización'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {modalAccion.solicitud.razonSocial || modalAccion.solicitud.nombre}
              </p>
            </div>

            <form onSubmit={handleConfirmAccion} className="p-6 space-y-4">
              {modalAccion.tipo === 'aprobar' ? (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Al verificar la organización, quedará habilitada para publicar eventos,
                  configurar localidades y operar en la plataforma.
                </p>
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
                        ? 'Indica los documentos o datos que el representante debe subsanar...'
                        : 'Explica las razones del rechazo de la solicitud...'
                    }
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 outline-none focus:border-indigo-600"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAccion(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50 ${
                    modalAccion.tipo === 'aprobar'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : modalAccion.tipo === 'correccion'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {actionLoading ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
