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
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import { formatHora12 } from '../../utils/formatters.js';

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
  // Requisito 5.4: Mostrar exactamente los 4 indicadores oficiales
  const publicados = stats.publicados ?? stats.aprobados ?? 0;
  const pendientesRevision = stats.pendientesRevision ?? stats.pendientes ?? totalPendientes ?? 0;
  const enCorreccion = stats.enCorreccion ?? stats.correccionesSolicitadas ?? 0;
  const rechazados = stats.rechazados ?? 0;

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FiShield className="w-5 h-5 text-brand" />
            <span>Panel de Control de Moderación</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión y control de calidad de eventos culturales postulados para publicación
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('eventos')}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-md shadow-brand/25 flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <span>Ir a Eventos Pendientes</span>
          <FiArrowRight size={15} />
        </button>
      </div>

      {/* Tarjetas de Estadísticas Reales: 4 indicadores oficiales (Requisito 5.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Eventos Publicados"
          value={statsLoading ? '...' : publicados.toLocaleString()}
          icon={FiCheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          subtitle="Visibles en cartelera"
        />

        <StatCard
          label="Revisiones Pendientes"
          value={statsLoading ? '...' : pendientesRevision.toLocaleString()}
          icon={FiClipboard}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          subtitle="En espera de moderación"
        />

        <StatCard
          label="Eventos en Corrección"
          value={statsLoading ? '...' : enCorreccion.toLocaleString()}
          icon={FiAlertTriangle}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          subtitle="Ajustes solicitados"
        />

        <StatCard
          label="Eventos Rechazados"
          value={statsLoading ? '...' : rechazados.toLocaleString()}
          icon={FiXCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          subtitle="No cumplen políticas"
        />
      </div>

      {/* Cola de Trabajo Prioritaria: Eventos Pendientes de Moderación */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900">
                Cola Prioritaria de Eventos
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand">
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
            className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 self-start sm:self-auto transition-colors"
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
            {pendientes.slice(0, 3).map((evento) => {
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
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand">
                          {categoriaNombre}
                        </span>
                        <Badge tone="amber">Pendiente</Badge>
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
                            {evento.fecha} {evento.hora ? `· ${formatHora12(evento.hora)}` : ''}
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
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FiEye size={13} />
                      <span>Revisar Detalle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSolicitarCorreccion(evento)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FiEdit3 size={13} />
                      <span>Corrección</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRechazar(evento)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <FiX size={13} />
                      <span>Rechazar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAprobar(evento.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-brand-dark text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1"
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
