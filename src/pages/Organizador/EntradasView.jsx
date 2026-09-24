import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCheck,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiLayers,
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import ViewToggle from '../../components/componentsOrganizador/ViewToggle.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';
import Pagination from '../../components/Shared/Pagination.jsx';

const ticketsSeed = [
  {
    id: 1,
    name: 'General - Early Bird',
    eventTitle: 'Festival Cartagena Jazz',
    price: 85000,
    vendidos: 180,
    disponibles: 120,
    descripcion: 'Acceso general al festival en Plaza de San Pedro con zona de comidas.',
    estado: 'Activa',
    tone: 'active',
    qrEnabled: true,
  },
  {
    id: 2,
    name: 'VIP Muralla Club',
    eventTitle: 'Festival Cartagena Jazz',
    price: 180000,
    vendidos: 62,
    disponibles: 38,
    descripcion: 'Zona lounge frente a tarima principal, barra libre de bienvenida y credencial.',
    estado: 'Activa',
    tone: 'active',
    qrEnabled: true,
  },
  {
    id: 3,
    name: 'Estudiante / Joven Cultural',
    eventTitle: 'Cátedra Historia Colonial',
    price: 45000,
    vendidos: 74,
    disponibles: 16,
    descripcion: 'Tarifa preferencial presentando carnet universitario o documento estudiantil.',
    estado: 'Bajo stock',
    tone: 'draft',
    qrEnabled: true,
  },
  {
    id: 4,
    name: 'Palco Platinum (4 personas)',
    eventTitle: 'Concierto Sinfónico Murallas',
    price: 450000,
    vendidos: 20,
    disponibles: 5,
    descripcion: 'Mesa privada reservada con servicio de mesero y botella de vino caribeño.',
    estado: 'Bajo stock',
    tone: 'draft',
    qrEnabled: true,
  },
  {
    id: 5,
    name: 'Acceso Libre con Registro',
    eventTitle: 'Torneo Vóley Playa',
    price: 0,
    vendidos: 140,
    disponibles: 60,
    descripcion: 'Pase digital gratuito con aforo controlado para gradas de playa.',
    estado: 'Activa',
    tone: 'active',
    qrEnabled: true,
  },
];

export default function EntradasView() {
  const [tickets, setTickets] = useState(ticketsSeed);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [editingTicket, setEditingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Totales y métricas agregadas
  const totalVendidas = useMemo(
    () => tickets.reduce((sum, t) => sum + t.vendidos, 0),
    [tickets]
  );
  const totalDisponibles = useMemo(
    () => tickets.reduce((sum, t) => sum + t.disponibles, 0),
    [tickets]
  );
  const totalRecaudado = useMemo(
    () => tickets.reduce((sum, t) => sum + t.vendidos * t.price, 0),
    [tickets]
  );
  const porcentajeTotal = useMemo(() => {
    const totalAforo = totalVendidas + totalDisponibles;
    return totalAforo > 0 ? Math.round((totalVendidas / totalAforo) * 100) : 0;
  }, [totalVendidas, totalDisponibles]);

  // Paginación para Grid
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, currentPage, pageSize]);

  const formatCurrency = (amount) => {
    if (amount === 0) return 'Gratis';
    return `$${Number(amount).toLocaleString('es-CO')}`;
  };

  const handleSaveTicket = (ticketData) => {
    if (!ticketData.name) return;
    setTickets((current) => {
      const exists = current.some((item) => item.id === ticketData.id);
      if (exists) {
        return current.map((item) => (item.id === ticketData.id ? { ...item, ...ticketData } : item));
      }
      return [{ ...ticketData, id: Date.now() }, ...current];
    });
    setEditingTicket(null);
  };

  const handleDeleteTicket = (ticketId) => {
    if (confirm('¿Estás seguro de que deseas eliminar este tipo de entrada?')) {
      setTickets((current) => current.filter((t) => t.id !== ticketId));
    }
  };

  // Definición de columnas para la vista en tabla
  const tableColumns = [
    {
      header: 'Localidad / Entrada',
      key: 'name',
      render: (_, row) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 text-xs">{row.name}</span>
            {row.qrEnabled && (
              <span title="Validación digital activada" className="text-brand">
                <FiCheckCircle size={13} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{row.descripcion}</p>
        </div>
      ),
    },
    {
      header: 'Precio Unitario',
      key: 'price',
      render: (val) => (
        <span className={`font-bold text-xs ${val === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      header: 'Ventas y Progreso',
      key: 'vendidos',
      render: (_, row) => {
        const total = row.vendidos + row.disponibles;
        const pct = total > 0 ? Math.round((row.vendidos / total) * 100) : 0;
        return (
          <div className="w-36">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-700">
                {row.vendidos} <span className="text-slate-400">/ {total}</span>
              </span>
              <span className="text-[10px] font-bold text-brand">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pct >= 90 ? 'bg-emerald-500' : 'bg-brand'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Disponibles',
      key: 'disponibles',
      render: (val) => (
        <span className="font-medium text-slate-700 text-xs">
          {val} restantes
        </span>
      ),
    },
    {
      header: 'Recaudado',
      key: 'recaudado',
      render: (_, row) => (
        <span className="font-bold text-slate-900 text-xs">
          {formatCurrency(row.vendidos * row.price)}
        </span>
      ),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (val, row) => <Badge tone={row.tone || 'active'}>{val}</Badge>,
    },
    {
      header: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditingTicket(row)}
            title="Editar entrada"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-brand hover:border-brand transition-colors"
          >
            <FiEdit3 size={13} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteTicket(row.id)}
            title="Eliminar entrada"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Botón Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión de Entradas y Aforo
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Crea localidades, ajusta precios en COP, define cupos disponibles y administra la validación por código QR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />

          <button
            type="button"
            onClick={() =>
              setEditingTicket({
                id: Date.now(),
                name: '',
                price: 0,
                vendidos: 0,
                disponibles: 100,
                descripcion: '',
                estado: 'Activa',
                tone: 'active',
                qrEnabled: true,
              })
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95 shrink-0"
          >
            <FiPlus size={16} /> Crear nueva entrada
          </button>
        </div>
      </div>

      {/* 2. KPIs y Métricas de Entradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Boletos Vendidos"
          value={totalVendidas.toLocaleString('es-CO')}
          change={`${porcentajeTotal}% de ocupación`}
          trend="up"
          icon={FiCreditCard}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
        <StatCard
          label="Entradas Disponibles"
          value={totalDisponibles.toLocaleString('es-CO')}
          change="Cupos restantes"
          trend="up"
          icon={FiLayers}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Ingresos Generados"
          value={`$${(totalRecaudado / 1000000).toFixed(1)}M COP`}
          change="+18.4% vs semana ant."
          trend="up"
          icon={FiDollarSign}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Ticket Promedio"
          value={
            totalVendidas > 0
              ? formatCurrency(Math.round(totalRecaudado / totalVendidas))
              : '$0'
          }
          change="Precio medio por entrada"
          trend="up"
          icon={FiTrendingUp}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* 3. Renderizado Condicional: Grid vs Table */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {paginatedTickets.map((ticket) => {
              const total = ticket.vendidos + ticket.disponibles;
              const pct = total > 0 ? Math.round((ticket.vendidos / total) * 100) : 0;

              return (
                <article
                  key={ticket.id}
                  className="group relative rounded-2xl border border-slate-200/85 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header del Ticket */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-brand transition-colors">
                            {ticket.name}
                          </h3>
                          {ticket.qrEnabled && (
                            <span title="Acceso Digital Habilitado" className="text-brand">
                              <FiCheckCircle size={14} />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {ticket.descripcion || 'Sin descripción adicional.'}
                        </p>
                      </div>

                      <Badge tone={ticket.tone || 'active'}>{ticket.estado}</Badge>
                    </div>

                    {/* Precio y progreso */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Precio
                        </span>
                        <span className="font-display text-2xl font-black text-slate-900">
                          {formatCurrency(ticket.price)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Ingresos
                        </span>
                        <span className="font-display text-sm font-bold text-emerald-600">
                          {formatCurrency(ticket.vendidos * ticket.price)}
                        </span>
                      </div>
                    </div>

                    {/* Medidor visual de venta */}
                    <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-600 font-medium">
                          Vendidas: <strong className="text-slate-900">{ticket.vendidos}</strong> / {total}
                        </span>
                        <span className="font-bold text-brand">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 90 ? 'bg-emerald-500' : 'bg-brand'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-400 text-right">
                        {ticket.disponibles} entradas disponibles
                      </p>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">
                      ID #{ticket.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteTicket(ticket.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar entrada"
                      >
                        <FiTrash2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTicket(ticket)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-brand hover:text-brand shadow-xs transition-colors"
                      >
                        <FiEdit3 size={13} />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Paginación para Grid */}
          {tickets.length > pageSize && (
            <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalItems={tickets.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[6, 9, 12]}
              />
            </div>
          )}
        </div>
      ) : (
        /* Vista en Tabla con Paginación Integrada */
        <DataTable
          title="Catálogo de Entradas y Localidades"
          subtitle={`Mostrando ${tickets.length} tipos de entrada activos`}
          columns={tableColumns}
          data={tickets}
          paginate={true}
          initialPageSize={5}
          pageSizeOptions={[5, 10, 20]}
          emptyMessage="No hay entradas registradas"
          emptyDescription="Comienza agregando las localidades para tus eventos."
        />
      )}

      {/* 4. Modal para Crear o Editar Entrada */}
      {editingTicket && (
        createPortal(
        <div className="fixed inset-0 z-[100] flex min-h-screen w-screen items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingTicket.id ? 'Personalizar Entrada' : 'Nueva Entrada'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configura el precio, capacidad máxima y opciones de acceso digital.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTicket(editingTicket);
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nombre de la Localidad / Entrada
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: General, VIP Muralla, Estudiante..."
                  value={editingTicket.name || ''}
                  onChange={(e) =>
                    setEditingTicket({ ...editingTicket, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Precio en COP (0 para Gratis)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={editingTicket.price ?? 0}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Entradas Disponibles (Aforo)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingTicket.disponibles ?? 100}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        disponibles: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Descripción y Beneficios
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe qué incluye esta entrada (ubicación, accesos especiales, bebida de cortesía...)"
                  value={editingTicket.descripcion || ''}
                  onChange={(e) =>
                    setEditingTicket({
                      ...editingTicket,
                      descripcion: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all resize-none"
                />
              </div>

              {/* Opciones booleanas */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingTicket.qrEnabled ?? true}
                    onChange={(e) =>
                      setEditingTicket({
                        ...editingTicket,
                        qrEnabled: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded accent-brand"
                  />
                  <span className="text-slate-700 font-semibold">Generar Código QR de acceso único</span>
                </label>
              </div>

              {/* Botones de acción */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand hover:bg-brand-dark px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
        )
      )}
    </div>
  );
}
