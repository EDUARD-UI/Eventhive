import React, { useState, useMemo } from 'react';
import {
  FiActivity,
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiAlertCircle,
  FiDownload,
  FiList,
  FiGrid,
  FiUser,
  FiDollarSign,
  FiShield,
  FiFilter,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

const ACTIVIDADES_SEED = [
  {
    id: 1,
    tipo: 'venta',
    tipoLabel: 'Venta de Boleto',
    titulo: 'Venta de Entrada VIP Muralla Club',
    descripcion: 'Ana Gómez compró 2 boletos VIP para "Festival Cartagena Jazz".',
    usuario: 'Ana Gómez (ana.gomez@gmail.com)',
    evento: 'Festival Cartagena Jazz',
    monto: '+$360.000 COP',
    montoRaw: 360000,
    tiempo: 'Hace 14 min',
    fechaHora: '23 Sep 2026, 04:52 PM',
    icono: FiCreditCard,
    estado: 'Completado',
    tone: 'active',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 2,
    tipo: 'checkin',
    tipoLabel: 'Check-in en Acceso',
    titulo: 'Validación en Puerta 1 - San Pedro',
    descripcion: 'Mateo Díaz escaneó su boleto General (B-08) para "Festival Cartagena Jazz".',
    usuario: 'Mateo Díaz',
    evento: 'Festival Cartagena Jazz',
    monto: 'Validado',
    montoRaw: 0,
    tiempo: 'Hace 38 min',
    fechaHora: '23 Sep 2026, 04:28 PM',
    icono: FiCheckCircle,
    estado: 'Acreditado',
    tone: 'blue',
    color: 'bg-blue-50 text-brand border-blue-200',
  },
  {
    id: 3,
    tipo: 'moderacion',
    tipoLabel: 'Aprobación PULEP',
    titulo: 'Permiso PULEP Distrital Autorizado',
    descripcion: 'El evento "Cátedra Historia Colonial" recibió el aval oficial de la Alcaldía Mayor de Cartagena.',
    usuario: 'Sistema Distrital PULEP',
    evento: 'Cátedra Historia Colonial',
    monto: 'Aprobado',
    montoRaw: 0,
    tiempo: 'Hace 2 horas',
    fechaHora: '23 Sep 2026, 02:40 PM',
    icono: FiShield,
    estado: 'Vigente',
    tone: 'active',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 4,
    tipo: 'resena',
    tipoLabel: 'Reseña de Asistente',
    titulo: 'Nueva Calificación 5 Estrellas',
    descripcion: '"Excelente logística y vistas a las murallas. Muy recomendada la experiencia del festival."',
    usuario: 'Sara Rojas',
    evento: 'Festival Cartagena Jazz',
    monto: '5.0 ★',
    montoRaw: 0,
    tiempo: 'Hace 4 horas',
    fechaHora: '23 Sep 2026, 12:15 PM',
    icono: FiStar,
    estado: 'Publicada',
    tone: 'amber',
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    id: 5,
    tipo: 'venta',
    tipoLabel: 'Venta de Boleto',
    titulo: 'Venta de Entrada General Early Bird',
    descripcion: 'Carlos Mendoza adquirió 1 boleto para "Festival Cartagena Jazz".',
    usuario: 'Carlos Mendoza (carlos.m@yahoo.com)',
    evento: 'Festival Cartagena Jazz',
    monto: '+$85.000 COP',
    montoRaw: 85000,
    tiempo: 'Hace 6 horas',
    fechaHora: '23 Sep 2026, 10:30 AM',
    icono: FiCreditCard,
    estado: 'Completado',
    tone: 'active',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 6,
    tipo: 'moderacion',
    tipoLabel: 'Auditoría Preventiva',
    titulo: 'Actualización Plan de Emergencia',
    descripcion: 'Se radicó el certificado actualizado de socorristas y ambulancia para aforo ampliado.',
    usuario: 'Gestión de Riesgo Cartagena',
    evento: 'Concierto Sinfónico Murallas',
    monto: 'Revisado',
    montoRaw: 0,
    tiempo: 'Ayer a las 4:30 PM',
    fechaHora: '22 Sep 2026, 04:30 PM',
    icono: FiAlertCircle,
    estado: 'Atendido',
    tone: 'draft',
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    id: 7,
    tipo: 'checkin',
    tipoLabel: 'Check-in en Acceso',
    titulo: 'Validación en Puerta VIP',
    descripcion: 'Diana Morales ingresó con credencial VIP y pulsera de zona lounge.',
    usuario: 'Diana Morales',
    evento: 'Festival Cartagena Jazz',
    monto: 'Validado',
    montoRaw: 0,
    tiempo: 'Ayer a las 2:10 PM',
    fechaHora: '22 Sep 2026, 02:10 PM',
    icono: FiCheckCircle,
    estado: 'Acreditado',
    tone: 'blue',
    color: 'bg-blue-50 text-brand border-blue-200',
  },
  {
    id: 8,
    tipo: 'venta',
    tipoLabel: 'Venta de Palco',
    titulo: 'Reserva Palco Platinum (4 pax)',
    descripcion: 'Producciones Caribe reservó Palco Platinum para el Concierto Sinfónico.',
    usuario: 'Producciones Caribe SAS',
    evento: 'Concierto Sinfónico Murallas',
    monto: '+$450.000 COP',
    montoRaw: 450000,
    tiempo: 'Ayer a las 11:00 AM',
    fechaHora: '22 Sep 2026, 11:00 AM',
    icono: FiCreditCard,
    estado: 'Completado',
    tone: 'active',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
];

export default function ActividadesView() {
  const [filtro, setFiltro] = useState('todos');
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const actividadesFiltradas = useMemo(() => {
    return ACTIVIDADES_SEED.filter((act) => {
      if (filtro === 'todos') return true;
      return act.tipo === filtro;
    });
  }, [filtro]);

  // Paginación para Timeline Feed
  const paginatedFeed = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return actividadesFiltradas.slice(start, start + pageSize);
  }, [actividadesFiltradas, currentPage, pageSize]);

  // Reset page if filter causes overflow
  const totalPages = Math.max(1, Math.ceil(actividadesFiltradas.length / pageSize));
  if (currentPage > totalPages && currentPage !== 1) {
    setCurrentPage(1);
  }

  // Columnas para la vista en tabla de Auditoría
  const auditTableColumns = [
    {
      header: 'Fecha y Hora',
      key: 'fechaHora',
      render: (val, row) => (
        <div>
          <p className="font-semibold text-slate-800 text-xs">{val}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{row.tiempo}</p>
        </div>
      ),
    },
    {
      header: 'Acción y Tipo',
      key: 'tipoLabel',
      render: (val, row) => {
        const Icon = row.icono;
        return (
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg border ${row.color}`}>
              <Icon size={13} />
            </span>
            <span className="font-bold text-slate-900 text-xs">{val}</span>
          </div>
        );
      },
    },
    {
      header: 'Detalle del Registro',
      key: 'descripcion',
      render: (val, row) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 text-xs truncate">{row.titulo}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{val}</p>
        </div>
      ),
    },
    {
      header: 'Evento / Contexto',
      key: 'evento',
      render: (val) => (
        <span className="font-medium text-slate-700 text-xs">
          {val}
        </span>
      ),
    },
    {
      header: 'Valor / Impacto',
      key: 'monto',
      render: (val, row) => (
        <span
          className={`font-display font-bold text-xs ${
            row.tipo === 'venta'
              ? 'text-emerald-600'
              : row.tipo === 'resena'
              ? 'text-amber-600'
              : 'text-brand'
          }`}
        >
          {val || '—'}
        </span>
      ),
    },
    {
      header: 'Estado',
      key: 'estado',
      align: 'right',
      render: (val, row) => <Badge tone={row.tone}>{val}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Botón de Exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Actividades Recientes y Auditoría
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Trazabilidad en tiempo real de transacciones de boletería, validaciones en puerta, aprobaciones PULEP y reseñas ciudadanas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch de Vista: Feed vs Tabla de Auditoría */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white text-brand shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiActivity size={14} />
              <span className="hidden sm:inline">Línea de Tiempo</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-brand shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FiList size={14} />
              <span className="hidden sm:inline">Tabla de Auditoría</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => alert('Descargando bitácora de auditoría en formato CSV certificado...')}
            className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:border-brand hover:text-brand shadow-sm transition-all shrink-0"
          >
            <FiDownload size={14} /> Exportar
          </button>
        </div>
      </div>

      {/* 2. KPIs y Métricas de Auditoría */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Operaciones Registradas Hoy"
          value="48 eventos"
          change="↑ 18% vs jornada previa"
          trend="up"
          icon={FiActivity}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Ingresos Auditados Hoy"
          value="$1.445.000 COP"
          change="100% conciliado bancario"
          trend="up"
          icon={FiDollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Acreditaciones en Puerta"
          value="294 accesos"
          change="En 2 salas simultáneas"
          trend="up"
          icon={FiCheckCircle}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* 3. Píldoras de Filtro por Categoría de Actividad */}
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
            onClick={() => {
              setFiltro(btn.id);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filtro === btn.id
                ? 'bg-brand text-white shadow-sm shadow-brand/20'
                : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* 4. Renderizado: Línea de Tiempo vs Tabla de Auditoría */}
      {viewMode === 'timeline' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
            {paginatedFeed.length > 0 ? (
              paginatedFeed.map((act) => {
                const Icon = act.icono;
                return (
                  <div
                    key={act.id}
                    className="p-4 sm:p-5 flex items-start gap-4 hover:bg-blue-50/20 transition-colors group"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${act.color}`}
                    >
                      <Icon size={19} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-bold text-sm text-slate-900 truncate">
                            {act.titulo}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400">
                            • {act.evento}
                          </span>
                        </div>

                        {act.monto && (
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-md self-start sm:self-auto ${
                              act.tipo === 'venta'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : act.tipo === 'resena'
                                ? 'text-amber-700 bg-amber-50 border border-amber-200'
                                : 'text-brand bg-brand-light border border-blue-100'
                            }`}
                          >
                            {act.monto}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {act.descripcion}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                        <span className="flex items-center gap-1">
                          <FiClock size={12} />
                          {act.tiempo}
                        </span>
                        <span>•</span>
                        <span>{act.fechaHora}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-slate-400 text-xs">
                No hay actividades que coincidan con el filtro seleccionado.
              </div>
            )}
          </div>

          {/* Paginación del Timeline Feed */}
          {actividadesFiltradas.length > pageSize && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={actividadesFiltradas.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            </div>
          )}
        </div>
      ) : (
        /* Vista en Tabla de Auditoría con Paginación Integrada */
        <DataTable
          title="Registro Oficial de Auditoría y Trazabilidad"
          subtitle={`Mostrando ${actividadesFiltradas.length} eventos de auditoría certificados`}
          columns={auditTableColumns}
          data={actividadesFiltradas}
          paginate={true}
          initialPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No se encontraron eventos de auditoría"
          emptyDescription="Ajusta el filtro superior para visualizar otros registros."
        />
      )}
    </div>
  );
}
