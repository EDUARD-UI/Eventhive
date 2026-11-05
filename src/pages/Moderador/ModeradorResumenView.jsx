import React from 'react';
import {
  FiClipboard,
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiTrendingUp,
  FiEye,
  FiCheck,
  FiEdit3,
  FiX,
  FiCalendar,
  FiMapPin,
  FiArrowRight,
  FiShield,
  FiLayers,
  FiUser,
  FiClock,
  FiLoader,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import { session } from '../../services/session.js';
import { formatFecha, formatHora24 } from '../../utils/formatters.js';

export default function ModeradorResumenView({
  stats = {},
  statsLoading = false,
  pendientes = [],
  pendientesLoading = false,
  totalPendientes = 0,
  actionLoading = false,
  onNavigateTab = () => {},
  onInspect = () => {},
  onAprobar = () => {},
  onSolicitarCorreccion = () => {},
  onRechazar = () => {},
}) {
  const sessionUser = session.getUser();
  const moderadorName = sessionUser?.name || 'Moderador';

  // 4 indicadores oficiales de moderación
  const publicados = stats.publicados ?? stats.aprobados ?? 0;
  const pendientesRevision = stats.pendientesRevision ?? stats.pendientes ?? totalPendientes ?? 0;
  const enCorreccion = stats.enCorreccion ?? stats.correccionesSolicitadas ?? 0;
  const rechazados = stats.rechazados ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Grid Superior: Hero Command + Quick Action KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-stretch">
        {/* Banner de Bienvenida Editorial */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
          {/* Acento sutil en esquina */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-amber-400/10 via-amber-400/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-black uppercase tracking-wider">
                <FiShield size={11} className="text-amber-600" />
                Centro de Auditoría & Calidad
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <FiCheckCircle size={10} className="text-emerald-600" />
                Moderador Activo
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 leading-tight">
              ¡Hola, {moderadorName}!
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl">
              Supervisa y audita la calidad técnica y editorial de los eventos culturales en Cartagena. Revisa solicitudes pendientes, asegura la veracidad de la información y garantiza la excelencia de la cartelera oficial.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('eventos')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0B1B3D] hover:bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-300 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <FiClipboard size={15} />
              <span>Bandeja de pendientes ({totalPendientes})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('historial')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <FiLayers size={14} className="text-slate-400" />
              <span>Explorar catálogo</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('perfil')}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiUser size={13} />
              <span>Mi perfil</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Atención Inmediata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
                <FiClipboard size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                  Cola Prioritaria de Moderación
                </span>
                <strong className="text-xl sm:text-2xl font-black font-display text-slate-900">
                  {statsLoading ? '...' : pendientesRevision.toLocaleString('es-CO')}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Eventos esperando dictamen
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-amber-100/70 text-amber-900 shrink-0">
              Urgente
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
                <FiCheckCircle size={20} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                  Eventos en Cartelera
                </span>
                <strong className="text-xl sm:text-2xl font-black font-display text-slate-900">
                  {statsLoading ? '...' : publicados.toLocaleString('es-CO')}
                </strong>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Aprobados y visibles en Cartagena
                </span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 shrink-0">
              Activos
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Estado (4 Indicadores Oficiales) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <FiCheckCircle size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Publicados
            </span>
            <strong className="text-xl font-black font-display text-slate-900">
              {statsLoading ? '...' : publicados.toLocaleString('es-CO')}
            </strong>
            <span className="text-[10px] text-slate-500 block">Aprobados en cartelera</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <FiClipboard size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              En Espera
            </span>
            <strong className="text-xl font-black font-display text-slate-900">
              {statsLoading ? '...' : pendientesRevision.toLocaleString('es-CO')}
            </strong>
            <span className="text-[10px] text-slate-500 block">Revisiones pendientes</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <FiAlertTriangle size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              En Corrección
            </span>
            <strong className="text-xl font-black font-display text-slate-900">
              {statsLoading ? '...' : enCorreccion.toLocaleString('es-CO')}
            </strong>
            <span className="text-[10px] text-slate-500 block">Ajustes requeridos</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
            <FiXCircle size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Rechazados
            </span>
            <strong className="text-xl font-black font-display text-slate-900">
              {statsLoading ? '...' : rechazados.toLocaleString('es-CO')}
            </strong>
            <span className="text-[10px] text-slate-500 block">Políticas no conformes</span>
          </div>
        </div>
      </div>

      {/* 3. Cola de Trabajo Prioritaria: Eventos Pendientes de Moderación */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-black text-slate-900">
                Cola Prioritaria de Eventos
              </h3>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {totalPendientes} pendientes
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Eventos en espera de tu dictamen técnico para ser publicados en la plataforma
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('eventos')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>Ver bandeja completa</span>
            <FiArrowRight size={14} />
          </button>
        </div>

        {pendientesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 rounded-2xl bg-slate-100 border border-slate-200/80 animate-pulse"
              />
            ))}
          </div>
        ) : pendientes.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
            <FiCheckCircle className="mx-auto text-emerald-500 mb-2" size={32} />
            <h4 className="font-display text-sm font-bold text-slate-800">
              ¡Bandeja al día!
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tienes eventos pendientes de moderación en este momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendientes.slice(0, 4).map((evento) => {
              const categoriaNombre =
                typeof evento.categoria === 'object'
                  ? evento.categoria?.nombre
                  : evento.categoria || 'Evento';

              const organizacionNombre =
                typeof evento.organizacion === 'object'
                  ? evento.organizacion?.nombre
                  : evento.organizacion || 'Organización';

              return (
                <div
                  key={evento.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Miniatura del evento */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {evento.foto ? (
                        <img
                          src={evento.foto}
                          alt={evento.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs">
                          EH
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">
                          {categoriaNombre}
                        </span>
                        <Badge tone="warning">Pendiente</Badge>
                      </div>

                      <h4 className="font-display text-sm font-extrabold text-slate-900 truncate">
                        {evento.titulo}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                        {organizacionNombre}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                        {evento.fecha && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-amber-500" size={13} />
                            {evento.fecha ? formatFecha(evento.fecha) : ''}{' '}
                            {evento.hora ? `· ${formatHora24(evento.hora)}` : ''}
                          </span>
                        )}
                        {evento.lugar && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <FiMapPin className="text-amber-500" size={13} />
                            <span className="truncate">{evento.lugar}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas con protección anti-doble clic */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onInspect(evento)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <FiEye size={13} />
                      <span>Revisar</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onSolicitarCorreccion(evento)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <FiEdit3 size={13} />
                      <span>Corrección</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onRechazar(evento)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <FiX size={13} />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => onAprobar(evento.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <FiLoader size={13} className="animate-spin" />
                      ) : (
                        <FiCheck size={13} />
                      )}
                      <span>Aprobar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
