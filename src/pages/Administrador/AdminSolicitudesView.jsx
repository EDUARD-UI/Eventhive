import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function AdminSolicitudesView({
  organizaciones = [],
  onNavigateTab,
  onVerPerfil,
}) {
  const pendientes = organizaciones.filter((o) => o.estado === 'PENDIENTE');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Alerta de Responsabilidad */}
      <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-950 mb-1">
              Delimitación de Responsabilidades: Módulo de Moderación
            </h3>
            <p className="text-xs text-amber-900 leading-relaxed max-w-3xl">
              Conforme a la <strong>Sección 3 de la especificación técnica</strong>:
              <em> "El Administrador no debe aprobar normalmente solicitudes de organizaciones ni eventos, porque esa responsabilidad pertenece al flujo de Moderación"</em>.
              <br />
              Las solicitudes de admisión, requerimientos de corrección de RUT y rechazos son gestionados por el equipo de moderadores en su bandeja de trabajo.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('organizaciones')}
                className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Ir a Gestión de Organizaciones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('moderadores')}
                className="px-4 py-2 rounded-xl bg-white text-amber-900 border border-amber-300 text-xs font-bold hover:bg-amber-50 transition-all flex items-center gap-1.5"
              >
                <span>Ver Carga de Moderadores</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Informativa de Organizaciones Pendientes */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Organizaciones en Bandeja de Moderación ({pendientes.length})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Vista de solo lectura para supervisión administrativa
        </p>

        <div className="divide-y divide-slate-100">
          {pendientes.map((org) => (
            <div key={org.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{org.nombre}</h4>
                <p className="text-[11px] text-slate-500">
                  NIT: {org.nit} • Rep: {org.representante} • Reg: {org.fechaRegistro}
                </p>
              </div>

              <button
                onClick={() => onVerPerfil(org)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <span>Inspeccionar</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
