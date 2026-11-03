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
  onNavigateTab,
  onInspect,
  onAprobar,
  onSolicitarCorreccion,
  onRechazar,
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
      {/* 1. Grid Superior: Banner de Bienvenida SaaS + Tarjetas KPI (Diseño idéntico al operador) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Banner de Bienvenida con borde de marca */}
        <div className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-slate-200 border-l-4 border-l-brand bg-white p-6 shadow-sm sm:p-7">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">
                Panel de Moderación
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <FiCheckCircle size={10} className="text-emerald-600" />
                <span>Auditoría Oficial</span>
              </span>
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              ¡Hola, {moderadorName}!
            </h2>
            <p className="text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              Supervisa y audita la calidad de los eventos culturales en Cartagena. Revisa eventos pendientes de publicación, solicita correcciones técnicas y garantiza la excelencia de la cartelera oficial.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateTab('eventos')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer active:scale-95"
            >
              <FiClipboard size={15} />
              <span>Eventos pendientes ({totalPendientes})</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('historial')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer"
            >
              <FiLayers size={14} className="text-slate-500" />
              <span>Explorar catálogo</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('perfil')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
            >
              <FiUser size={13} className="text-slate-500" />
              <span>Mi perfil</span>
            </button>
          </div>
        </div>

        {/* Tarjeta KPI Lateral de Atención Inmediata */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <FiClipboard size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Cola Prioritaria de Moderación
                </span>
                <strong className="text-xl font-black text-slate-900">
                  {statsLoading ? '...' : pendientesRevision.toLocaleString('es-CO')}
                </strong>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              Urgente
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle size={18} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Eventos Publicados en Cartelera
                </span>
                <strong className="text-xl font-black text-slate-900">
                  {statsLoading ? '...' : publicados.toLocaleString('es-CO')}
                </strong>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700">Activos</span>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas KPI de Estado (4 Indicadores Oficiales de Moderación) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Eventos Publicados"
          value={statsLoading ? '...' : publicados.toLocaleString('es-CO')}
          icon={FiCheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          subtitle="Aprobados en cartelera"
        />

        <StatCard
          label="Revisiones Pendientes"
          value={statsLoading ? '...' : pendientesRevision.toLocaleString('es-CO')}
          icon={FiClipboard}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          subtitle="En espera de dictamen"
        />

        <StatCard
          label="Eventos en Corrección"
          value={statsLoading ? '...' : enCorreccion.toLocaleString('es-CO')}
          icon={FiAlertTriangle}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="Ajustes técnicos pedidos"
        />

        <StatCard
          label="Eventos Rechazados"
          value={statsLoading ? '...' : rechazados.toLocaleString('es-CO')}
          icon={FiXCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          subtitle="No conformes a políticas"
        />
      </div>

      {/* 3. Cola de Trabajo Prioritaria: Eventos Pendientes de Moderación */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900">
                Cola Prioritaria de Eventos
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
                {totalPendientes} pendientes
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Eventos en espera de tu dictamen técnico para ser publicados en la plataforma
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('eventos')}
            className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
          >
            <span>Ver bandeja completa</span>
            <FiArrowRight size={14} />
          </button>
        </div>

        {pendientesLoading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-slate-100/70 border border-slate-200/60 animate-pulse"
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
          <div className="space-y-4">
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
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Miniatura del evento */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/70">
                      {evento.foto ? (
                        <img
                          src={evento.foto}
                          alt={evento.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                      )}
                    </div>

                    {/* Información */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-800 border border-amber-500/30">
                          {categoriaNombre}
                        </span>
                        <Badge tone="warning">Pendiente</Badge>
                      </div>

                      <h4 className="font-display text-sm font-bold text-slate-900 truncate">
                        {evento.titulo}
                      </h4>

                      <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                        {organizacionNombre}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                        {evento.fecha && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-brand" size={13} />
                            {evento.fecha ? formatFecha(evento.fecha) : ''} {evento.hora ? `· ${formatHora24(evento.hora)}` : ''}
                          </span>
                        )}
                        {evento.lugar && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <FiMapPin className="text-brand" size={13} />
                            <span className="truncate">{evento.lugar}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones Rápidas */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onInspect(evento)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FiEye size={13} />
                      <span>Revisar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSolicitarCorreccion(evento)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FiEdit3 size={13} />
                      <span>Corrección</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRechazar(evento)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <FiX size={13} />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAprobar(evento.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                    >
                      <FiCheck size={13} />
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
