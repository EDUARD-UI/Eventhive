import { useState } from 'react';
import {
  FiActivity,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiAlertCircle,
  FiDownload,
  FiFilter,
} from 'react-icons/fi';

const ACTIVIDADES_SEED = [
  {
    id: 1,
    tipo: 'venta',
    titulo: 'Venta de Entrada VIP',
    descripcion: 'Ana Gómez compró 2 boletos VIP para "Festival Cartagena Jazz".',
    monto: '+$360.000 COP',
    tiempo: 'Hace 14 min',
    icono: FiCreditCard,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 2,
    tipo: 'checkin',
    titulo: 'Check-in en Acceso Puerta 1',
    descripcion: 'Mateo Díaz escaneó su boleto General (A-14) para "Noche de Sabores".',
    monto: null,
    tiempo: 'Hace 38 min',
    icono: FiCheckCircle,
    color: 'bg-blue-50 text-brand border-blue-200',
  },
  {
    id: 3,
    tipo: 'moderacion',
    titulo: 'Aprobación PULEP Exitosa',
    descripcion: 'El evento "Cátedra Historia Colonial" fue aprobado por la Alcaldía de Cartagena.',
    monto: 'Aprobado',
    tiempo: 'Hace 2 horas',
    icono: FiActivity,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 4,
    tipo: 'resena',
    titulo: 'Nueva Reseña 5 Estrellas',
    descripcion: '"Excelente logística y vistas a las murallas. Muy recomendada la experiencia."',
    monto: '5.0 ★',
    tiempo: 'Hace 4 horas',
    icono: FiStar,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 5,
    tipo: 'venta',
    titulo: 'Venta de Entrada General',
    descripcion: 'Carlos Rodríguez adquirió 1 boleto para "Festival Cartagena Jazz".',
    monto: '+$85.000 COP',
    tiempo: 'Hace 6 horas',
    icono: FiCreditCard,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 6,
    tipo: 'moderacion',
    titulo: 'Documento Pendiente Notificado',
    descripcion: 'Se solicita actualizar certificado de primeros auxilios para nuevo aforo.',
    monto: 'Atención',
    tiempo: 'Ayer a las 4:30 PM',
    icono: FiAlertCircle,
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
];

export default function ActividadesView() {
  const [filtro, setFiltro] = useState('todos');

  const actividadesFiltradas = ACTIVIDADES_SEED.filter((act) => {
    if (filtro === 'todos') return true;
    return act.tipo === filtro;
  });

  return (
    <div className="space-y-6 animate-fade-in font-body">
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Actividades Recientes y Auditoría</h2>
          <p className="text-xs text-muted mt-0.5">
            Registro cronológico en tiempo real de transacciones, validaciones y accesos a tus eventos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Descargando registro de auditoría en formato CSV/Excel...')}
          className="flex items-center gap-2 rounded-xl bg-white border border-borderc px-4 py-2.5 text-xs font-semibold text-ink shadow-sm hover:border-brand hover:text-brand transition-all"
        >
          <FiDownload size={14} /> Exportar Auditoría
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-borderc rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted font-medium">Movimientos hoy</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">48 eventos</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ 18% vs día anterior</p>
        </div>
        <div className="bg-white border border-borderc rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted font-medium">Ingresos generados hoy</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">$1.445.000 COP</p>
          <p className="text-[11px] text-brand font-semibold mt-1">100% procesado</p>
        </div>
        <div className="bg-white border border-borderc rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted font-medium">Asistencia verificada</p>
          <p className="font-display text-2xl font-bold text-ink mt-1">294 asistentes</p>
          <p className="text-[11px] text-slate-500 mt-1">En 2 eventos simultáneos</p>
        </div>
      </div>

      {/* Píldoras de Filtro */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todas las actividades' },
          { id: 'venta', label: 'Ventas de boletos' },
          { id: 'checkin', label: 'Check-ins en puerta' },
          { id: 'moderacion', label: 'Aprobaciones PULEP' },
          { id: 'resena', label: 'Reseñas' },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setFiltro(btn.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filtro === btn.id
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Feed de Actividades */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {actividadesFiltradas.map((act) => {
            const Icon = act.icono;
            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${act.color}`}
                >
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display font-semibold text-sm text-ink truncate">
                      {act.titulo}
                    </h4>
                    {act.monto && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          act.tipo === 'venta'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : 'text-brand bg-brand-light'
                        }`}
                      >
                        {act.monto}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{act.descripcion}</p>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted mt-2">
                    <FiClock size={12} />
                    <span>{act.tiempo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
