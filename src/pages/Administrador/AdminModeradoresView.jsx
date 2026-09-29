import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Mail,
  Calendar,
  Sliders,
  Check,
  Ban,
  UserPlus,
} from 'lucide-react';
import Badge from '../../components/Shared/Badge.jsx';

export default function AdminModeradoresView({
  moderadores = [],
  moderationStats = {},
  onAsignarModerador,
  onToggleEstadoModerador,
}) {
  const [filtroZona, setFiltroZona] = useState('TODAS');

  const filteredModeradores = moderadores.filter((m) => {
    return filtroZona === 'TODAS' || m.zonaAsignada === filtroZona;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* SECCIÓN 9: Estadísticas de Moderación (Separadas de la bandeja de trabajo) */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <span>Estadísticas de Rendimiento de Moderación</span>
          </h2>
          <p className="text-xs text-slate-500">
            Métricas de auditoría de contenido y tiempos de respuesta según Sección 9 del módulo
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Revisiones
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {moderationStats.revisionesRealizadas || 148}
            </span>
            <span className="text-[10px] text-slate-400">Total histórico</span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Aprobaciones
            </span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">
              {moderationStats.aprobacionesPorcentaje || 82}%
            </span>
            <span className="text-[10px] text-emerald-600">Conforme a norma</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 shadow-xs">
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
              Rechazos
            </span>
            <span className="text-2xl font-black text-rose-800 mt-1 block">
              {moderationStats.rechazosPorcentaje || 8}%
            </span>
            <span className="text-[10px] text-rose-600">Por PULEP / RUT</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 shadow-xs">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Correcciones
            </span>
            <span className="text-2xl font-black text-amber-800 mt-1 block">
              {moderationStats.correccionesPorcentaje || 10}%
            </span>
            <span className="text-[10px] text-amber-600">Subsanables</span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
              Tiempo Promedio
            </span>
            <span className="text-2xl font-black text-indigo-800 mt-1 block">
              {moderationStats.tiempoPromedioRevision || '0h'}
            </span>
            <span className="text-[10px] text-indigo-600">SLA &lt; 4 horas</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Carga Promedio
            </span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {moderationStats.cargaPorModerador || '0'}
            </span>
            <span className="text-[10px] text-slate-400">Casos activos/agente</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 6: Gestión de Moderadores */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" strokeWidth={1.75} />
              <span>Equipo de Moderadores de la Plataforma</span>
            </h3>
            <p className="text-xs text-slate-500">
              Control de acceso seguro y asignación de zonas en Cartagena de Indias
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="TODAS">Todas las Zonas</option>
              <option value="Centro Histórico">Centro Histórico</option>
              <option value="Bocagrande">Bocagrande</option>
              <option value="Getsemaní">Getsemaní</option>
              <option value="Zona Norte">Zona Norte</option>
            </select>
          </div>
        </div>

        {/* Tarjetas de Moderadores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModeradores.map((mod) => (
            <div
              key={mod.id}
              className={`p-4 rounded-2xl border transition-all ${
                mod.activo
                  ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm shrink-0">
                    {mod.nombre?.charAt(0) || 'M'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {mod.nombre}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{mod.email}</span>
                    </p>
                  </div>
                </div>

                <Badge variant={mod.activo ? 'success' : 'danger'} size="xs">
                  {mod.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Métricas y Carga */}
              <div className="grid grid-cols-2 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Carga Activa
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {mod.cargaActual || 0} pendientes
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Efectividad
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {mod.efectividad || '—'}
                  </span>
                </div>
              </div>

              {/* Zona Asignada */}
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" strokeWidth={1.75} />
                  <span>Zona:</span>
                </span>
                <span className="font-bold text-slate-800">{mod.zonaAsignada}</span>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onAsignarModerador(mod)}
                  className="flex-1 py-1.5 px-2.5 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Asignar Zona</span>
                </button>

                <button
                  onClick={() => onToggleEstadoModerador(mod.id, !mod.activo)}
                  className={`py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1 ${
                    mod.activo
                      ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                  title={mod.activo ? 'Desactivar Acceso' : 'Activar Acceso'}
                >
                  {mod.activo ? (
                    <>
                      <Ban className="w-3 h-3" />
                      <span>Desactivar</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Activar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
