import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEdit3,
  FiMail,
  FiPlus,
  FiSearch,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import StatCard from '../../components/Shared/StatCard.jsx';
import DataTable from '../../components/Shared/DataTable.jsx';
import Badge from '../../components/Shared/Badge.jsx';

const asistentesPorEvento = [
  {
    id: 1,
    nombre: 'Festival Cartagena Jazz',
    categoria: 'Música',
    capacidad: 350,
    confirmados: 280,
    pendientes: 42,
    checkins: 210,
    status: 'Activo',
    attendees: [
      { id: 10, nombre: 'Ana Gómez', email: 'ana.gomez@gmail.com', tipo: 'VIP', estado: 'Confirmado', entrada: 'A-01', telefono: '+57 300 123 4567' },
      { id: 11, nombre: 'Luis Ortega', email: 'luis.ortega@hotmail.com', tipo: 'General', estado: 'Pendiente', entrada: 'B-03', telefono: '+57 311 234 5678' },
      { id: 12, nombre: 'Sara Rojas', email: 'sara.rojas@outlook.com', tipo: 'VIP', estado: 'Check-in', entrada: 'A-02', telefono: '+57 320 345 6789' },
      { id: 13, nombre: 'Mateo Díaz', email: 'mateo.diaz@gmail.com', tipo: 'General', estado: 'Check-in', entrada: 'B-08', telefono: '+57 315 456 7890' },
      { id: 14, nombre: 'Valentina Castro', email: 'valen.castro@gmail.com', tipo: 'VIP', estado: 'Confirmado', entrada: 'A-05', telefono: '+57 318 567 8901' },
      { id: 15, nombre: 'Carlos Mendoza', email: 'carlos.m@yahoo.com', tipo: 'General', estado: 'Pendiente', entrada: 'B-12', telefono: '+57 301 678 9012' },
      { id: 16, nombre: 'Diana Morales', email: 'diana.morales@gmail.com', tipo: 'VIP', estado: 'Check-in', entrada: 'A-09', telefono: '+57 312 789 0123' },
      { id: 17, nombre: 'Felipe Herrera', email: 'felipe.h@gmail.com', tipo: 'General', estado: 'Confirmado', entrada: 'B-15', telefono: '+57 314 890 1234' },
      { id: 18, nombre: 'Gabriela Silva', email: 'gaby.silva@outlook.com', tipo: 'General', estado: 'Confirmado', entrada: 'B-22', telefono: '+57 316 901 2345' },
      { id: 19, nombre: 'Jorge Restrepo', email: 'jorge.r@gmail.com', tipo: 'General', estado: 'Pendiente', entrada: 'B-30', telefono: '+57 319 012 3456' },
      { id: 20, nombre: 'Isabella Pardo', email: 'isabella.pardo@gmail.com', tipo: 'VIP', estado: 'Check-in', entrada: 'A-14', telefono: '+57 310 123 9876' },
    ],
  },
  {
    id: 2,
    nombre: 'Noche de Sabores del Caribe',
    categoria: 'Gastronomía',
    capacidad: 180,
    confirmados: 150,
    pendientes: 18,
    checkins: 128,
    status: 'Activo',
    attendees: [
      { id: 21, nombre: 'Camila Torres', email: 'camila.t@gmail.com', tipo: 'General', estado: 'Confirmado', entrada: 'C-04', telefono: '+57 300 987 6543' },
      { id: 22, nombre: 'Daniel Ruiz', email: 'daniel.ruiz@gmail.com', tipo: 'Premium', estado: 'Pendiente', entrada: 'P-01', telefono: '+57 301 876 5432' },
      { id: 23, nombre: 'Paula Vega', email: 'paula.vega@gmail.com', tipo: 'General', estado: 'Check-in', entrada: 'C-07', telefono: '+57 302 765 4321' },
      { id: 24, nombre: 'Andrés Marín', email: 'andres.marin@hotmail.com', tipo: 'Premium', estado: 'Confirmado', entrada: 'P-04', telefono: '+57 303 654 3210' },
      { id: 25, nombre: 'Lucía Benítez', email: 'lucia.b@gmail.com', tipo: 'General', estado: 'Check-in', entrada: 'C-11', telefono: '+57 304 543 2109' },
    ],
  },
  {
    id: 3,
    nombre: 'Cátedra Historia Colonial',
    categoria: 'Académico',
    capacidad: 120,
    confirmados: 90,
    pendientes: 11,
    checkins: 82,
    status: 'Borrador',
    attendees: [
      { id: 31, nombre: 'Juliana Peña', email: 'juliana.p@gmail.com', tipo: 'Estudiante', estado: 'Confirmado', entrada: 'G-02', telefono: '+57 305 432 1098' },
      { id: 32, nombre: 'Carlos Peña', email: 'carlos.p@gmail.com', tipo: 'General', estado: 'Pendiente', entrada: 'G-04', telefono: '+57 306 321 0987' },
      { id: 33, nombre: 'Esteban Cifuentes', email: 'esteban.c@unal.edu.co', tipo: 'Estudiante', estado: 'Check-in', entrada: 'G-08', telefono: '+57 307 210 9876' },
    ],
  },
];

export default function AsistentesView() {
  const [selectedEventId, setSelectedEventId] = useState(asistentesPorEvento[0].id);
  const [eventsData, setEventsData] = useState(asistentesPorEvento);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAttendee, setEditingAttendee] = useState(null);

  const selectedEvent = useMemo(
    () => eventsData.find((event) => event.id === selectedEventId) ?? eventsData[0],
    [eventsData, selectedEventId]
  );

  // Filtrado de asistentes del evento seleccionado
  const filteredAttendees = useMemo(() => {
    return selectedEvent.attendees.filter((att) => {
      const matchesStatus = statusFilter === 'Todos' || att.estado === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        att.nombre.toLowerCase().includes(term) ||
        att.email.toLowerCase().includes(term) ||
        att.entrada.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [selectedEvent, statusFilter, searchTerm]);

  // Totales agregados globales
  const totalConfirmados = useMemo(
    () => eventsData.reduce((sum, e) => sum + e.confirmados, 0),
    [eventsData]
  );
  const totalPendientes = useMemo(
    () => eventsData.reduce((sum, e) => sum + e.pendientes, 0),
    [eventsData]
  );
  const totalCheckins = useMemo(
    () => eventsData.reduce((sum, e) => sum + e.checkins, 0),
    [eventsData]
  );

  // Acción rápida: Marcar o desmarcar Check-in
  const handleToggleCheckin = (attendeeId) => {
    setEventsData((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id !== selectedEventId) return evt;
        const updatedAttendees = evt.attendees.map((att) => {
          if (att.id !== attendeeId) return att;
          const newStatus = att.estado === 'Check-in' ? 'Confirmado' : 'Check-in';
          return { ...att, estado: newStatus };
        });
        const newCheckins = updatedAttendees.filter((a) => a.estado === 'Check-in').length;
        return { ...evt, attendees: updatedAttendees, checkins: newCheckins };
      })
    );
  };

  // Guardar edición de asistente
  const handleSaveAttendee = (updated) => {
    setEventsData((prevEvents) =>
      prevEvents.map((evt) => {
        if (evt.id !== selectedEventId) return evt;
        return {
          ...evt,
          attendees: evt.attendees.map((att) => (att.id === updated.id ? updated : att)),
        };
      })
    );
    setEditingAttendee(null);
  };

  // Columnas para la tabla moderna de Asistentes
  const attendeeColumns = [
    {
      header: 'Asistente',
      key: 'nombre',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand/20 to-brand/40 text-brand font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
            {row.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <p className="font-display font-bold text-slate-900 text-xs">{row.nombre}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <FiMail size={11} className="text-slate-400" />
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipo de Entrada',
      key: 'tipo',
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
          {val}
        </span>
      ),
    },
    {
      header: 'Boleto / Asiento',
      key: 'entrada',
      render: (val) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {val}
        </span>
      ),
    },
    {
      header: 'Estado',
      key: 'estado',
      render: (val) => {
        let tone = 'gray';
        if (val === 'Check-in') tone = 'blue';
        else if (val === 'Confirmado') tone = 'active';
        else if (val === 'Pendiente') tone = 'draft';
        return <Badge tone={tone}>{val}</Badge>;
      },
    },
    {
      header: 'Acciones',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Botón rápido de Check-in */}
          <button
            type="button"
            onClick={() => handleToggleCheckin(row.id)}
            title={row.estado === 'Check-in' ? 'Cancelar Check-in' : 'Registrar Check-in'}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              row.estado === 'Check-in'
                ? 'bg-blue-50 text-brand border border-blue-200 hover:bg-blue-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <FiCheckCircle size={12} />
            <span>{row.estado === 'Check-in' ? 'Validado' : 'Check-in'}</span>
          </button>

          <button
            type="button"
            onClick={() => setEditingAttendee(row)}
            title="Editar datos del asistente"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-brand hover:border-brand transition-colors"
          >
            <FiEdit3 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header con Título y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Control de Asistentes y Acreditación
          </h2>
          <p className="mt-1 text-xs text-slate-500 max-w-xl">
            Valida boletos en puerta, consulta el estado de confirmaciones y exporta la lista de asistentes en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => alert('Exportando lista de asistentes en formato CSV/Excel...')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
          >
            <FiDownload size={14} /> Exportar lista
          </button>

          <button
            type="button"
            onClick={() =>
              setEditingAttendee({
                id: Date.now(),
                nombre: '',
                email: '',
                tipo: 'General',
                estado: 'Confirmado',
                entrada: 'G-' + Math.floor(Math.random() * 90 + 10),
                telefono: '',
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand hover:bg-brand-dark px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 transition-all active:scale-95"
          >
            <FiPlus size={15} /> Añadir asistente
          </button>
        </div>
      </div>

      {/* 2. KPIs y Métricas de Asistencia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Confirmados"
          value={totalConfirmados.toLocaleString('es-CO')}
          change="Pagos o reservas activas"
          trend="up"
          icon={FiUsers}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Pendientes por Confirmar"
          value={totalPendientes.toLocaleString('es-CO')}
          change="En espera de pago"
          trend="up"
          icon={FiClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          label="Check-in en Puerta"
          value={totalCheckins.toLocaleString('es-CO')}
          change={`${Math.round((totalCheckins / totalConfirmados) * 100)}% de asistencia en sala`}
          trend="up"
          icon={FiUserCheck}
          iconBg="bg-blue-50"
          iconColor="text-brand"
        />
      </div>

      {/* 3. Panel Dividido: Selector de Evento y Tabla de Asistentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Selector de Evento (Sidebar lateral / desplegable) */}
        <aside className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display text-sm font-bold text-slate-900">
              Seleccionar Evento
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {eventsData.length} eventos
            </span>
          </div>

          <div className="space-y-2.5">
            {eventsData.map((event) => {
              const isSelected = selectedEventId === event.id;
              const checkinPct = Math.round((event.checkins / event.confirmados) * 100) || 0;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-brand bg-brand-light/40 shadow-sm ring-1 ring-brand/20'
                      : 'border-slate-200/70 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-display text-xs font-bold leading-tight ${isSelected ? 'text-brand' : 'text-slate-900'}`}>
                      {event.nombre}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                      {event.categoria}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      <strong className="text-slate-800">{event.checkins}</strong> / {event.confirmados} check-in
                    </span>
                    <span className="font-bold text-brand">{checkinPct}%</span>
                  </div>

                  {/* Barra de progreso de checkin */}
                  <div className="mt-1.5 h-1 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${checkinPct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Sección Principal con Filtros y Tabla Paginada */}
        <section className="space-y-4 min-w-0">
          {/* Barra de Búsqueda y Filtros de Estado */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
            <div className="relative flex-1">
              <FiSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar asistente por nombre, correo o boleto..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-brand cursor-pointer"
              >
                <option value="Todos">Todos ({selectedEvent.attendees.length})</option>
                <option value="Confirmado">Confirmados</option>
                <option value="Check-in">Check-in</option>
                <option value="Pendiente">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Tabla de Asistentes Refactorizada con Paginación Estándar */}
          <DataTable
            title={selectedEvent.nombre}
            subtitle={`${filteredAttendees.length} asistentes encontrados`}
            badge={`${selectedEvent.checkins} Validados`}
            columns={attendeeColumns}
            data={filteredAttendees}
            paginate={true}
            initialPageSize={5}
            pageSizeOptions={[5, 10, 20]}
            emptyMessage="No se encontraron asistentes"
            emptyDescription="Prueba modificando el término de búsqueda o el filtro de estado."
          />
        </section>
      </div>

      {/* 4. Modal para Crear o Editar Asistente */}
      {editingAttendee && (
        createPortal(
        <div className="fixed inset-0 z-[100] flex min-h-screen w-screen items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {editingAttendee.id ? 'Editar Asistente' : 'Nuevo Asistente'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Actualiza los datos personales y el estado de acreditación.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAttendee(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAttendee(editingAttendee);
              }}
              className="mt-5 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingAttendee.nombre || ''}
                  onChange={(e) =>
                    setEditingAttendee({ ...editingAttendee, nombre: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={editingAttendee.email || ''}
                  onChange={(e) =>
                    setEditingAttendee({ ...editingAttendee, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Tipo de Entrada
                  </label>
                  <select
                    value={editingAttendee.tipo || 'General'}
                    onChange={(e) =>
                      setEditingAttendee({ ...editingAttendee, tipo: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand transition-all cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="VIP">VIP</option>
                    <option value="Premium">Premium</option>
                    <option value="Estudiante">Estudiante</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Estado de Asistencia
                  </label>
                  <select
                    value={editingAttendee.estado || 'Confirmado'}
                    onChange={(e) =>
                      setEditingAttendee({ ...editingAttendee, estado: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-brand transition-all cursor-pointer"
                  >
                    <option value="Confirmado">Confirmado</option>
                    <option value="Check-in">Check-in</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAttendee(null)}
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
