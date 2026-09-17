import { useMemo, useState } from 'react';
import { FiCheck, FiEdit3, FiUsers, FiX } from 'react-icons/fi';

//datos en quemado de ejemplo, hasta que se conecte con la API
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
            { id: 10, nombre: 'Ana Gómez', email: 'ana@gmail.com', tipo: 'VIP', estado: 'Confirmado', entrada: 'A1' },
            { id: 11, nombre: 'Luis Ortega', email: 'luis@gmail.com', tipo: 'General', estado: 'Pendiente', entrada: 'B3' },
            { id: 12, nombre: 'Sara Rojas', email: 'sara@gmail.com', tipo: 'VIP', estado: 'Check-in', entrada: 'A2' },
            { id: 13, nombre: 'Mateo Díaz', email: 'mateo@gmail.com', tipo: 'General', estado: 'Confirmado', entrada: 'B8' },
        ],
    },
    {
        id: 2,
        nombre: 'Noche de Sabores',
        categoria: 'Gastronomía',
        capacidad: 180,
        confirmados: 150,
        pendientes: 18,
        checkins: 128,
        status: 'Activo',
        attendees: [
            { id: 20, nombre: 'Camila Torres', email: 'camila@gmail.com', tipo: 'General', estado: 'Confirmado', entrada: 'C4' },
            { id: 21, nombre: 'Daniel Ruiz', email: 'daniel@gmail.com', tipo: 'Premium', estado: 'Pendiente', entrada: 'P1' },
            { id: 22, nombre: 'Paula Vega', email: 'paula@gmail.com', tipo: 'General', estado: 'Check-in', entrada: 'C7' },
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
            { id: 30, nombre: 'Juliana P.', email: 'juliana@gmail.com', tipo: 'General', estado: 'Confirmado', entrada: 'G2' },
            { id: 31, nombre: 'Carlos P.', email: 'carlos@gmail.com', tipo: 'General', estado: 'Pendiente', entrada: 'G4' },
        ],
    },
];

function statusTone(status) {
    if (status === 'Confirmado') return 'bg-[#dff7eb] text-[#0d9a5f]';
    if (status === 'Pendiente') return 'bg-[#fff0d9] text-[#d97c0d]';
    if (status === 'Check-in') return 'bg-[#dfeaff] text-[#1a60d0]';
    return 'bg-[#edf2f7] text-[#667a90]';
}

export default function AsistentesView() {
    const [selectedEventId, setSelectedEventId] = useState(asistentesPorEvento[0].id);
    const [editingAttendee, setEditingAttendee] = useState(null);

    const selectedEvent = useMemo(
        () => asistentesPorEvento.find((event) => event.id === selectedEventId) ?? asistentesPorEvento[0],
        [selectedEventId],
    );

    const total = asistentesPorEvento.reduce((sum, event) => sum + event.confirmados, 0);
    const pendientes = asistentesPorEvento.reduce((sum, event) => sum + event.pendientes, 0);
    const checkins = asistentesPorEvento.reduce((sum, event) => sum + event.checkins, 0);

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] font-bold text-[#172033]">Asistentes</h2>
                    <p className="mt-0.5 text-[13px] text-[#71839c]">Controla confirmaciones, check-in y asistencia por evento.</p>
                </div>
                <button type="button" className="rounded-[8px] border border-[#dfe7f1] bg-white px-4 py-2 text-[12px] font-semibold text-[#172033] shadow-sm hover:border-[#087fea]">
                    Exportar lista
                </button>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard value={String(total)} label="Confirmados" color="bg-[#d9fbe8]" icon={<FiUsers size={18} />} />
                <StatCard value={String(pendientes)} label="Pendientes" color="bg-[#fff0d9]" icon={<FiUsers size={18} />} />
                <StatCard value={String(checkins)} label="Check-in" color="bg-[#dfeaff]" icon={<FiCheck size={18} />} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="rounded-[13px] border border-[#e0e6ed] bg-white p-4">
                    <h3 className="font-display text-[14px] font-bold text-[#172033]">Eventos</h3>
                    <div className="mt-4 space-y-3">
                        {asistentesPorEvento.map((event) => (
                            <button
                                key={event.id}
                                type="button"
                                onClick={() => setSelectedEventId(event.id)}
                                className={`w-full rounded-[10px] border p-3 text-left transition ${selectedEventId === event.id ? 'border-[#087fea] bg-[#edf6ff]' : 'border-[#e5ebf2] bg-[#f9fbfd]'}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-bold text-[#172033]">{event.nombre}</p>
                                        <p className="mt-1 text-[10px] text-[#71839c]">{event.categoria}</p>
                                    </div>
                                    <span className="rounded-full bg-[#eaf3ff] px-2 py-0.5 text-[9px] font-semibold text-[#0e6fe9]">{event.status}</span>
                                </div>
                                <p className="mt-3 text-[10px] text-[#6a7f96]">{event.confirmados}/{event.capacidad} confirmados</p>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="rounded-[13px] border border-[#e0e6ed] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-display text-[14px] font-bold text-[#172033]">{selectedEvent.nombre}</h3>
                            <p className="text-[10px] text-[#71839c]">{selectedEvent.confirmados} confirmados · {selectedEvent.pendientes} pendientes</p>
                        </div>
                        <button type="button" className="rounded-[8px] bg-[#087fea] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#006ed8]">
                            + Invitar asistentes
                        </button>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full min-w-[620px] border-collapse">
                            <thead>
                                <tr className="border-b border-[#ebf0f5] text-[9px] uppercase text-[#71839c]">
                                    <th className="py-2 text-left font-semibold">Asistente</th>
                                    <th className="py-2 text-left font-semibold">Tipo</th>
                                    <th className="py-2 text-left font-semibold">Entrada</th>
                                    <th className="py-2 text-left font-semibold">Estado</th>
                                    <th className="py-2 text-right font-semibold">Acción</th>
                                </tr>
                            </thead>
                            {/* colocar paginacion para esta tabla, ya que puede haber muchos asistentes y no se veria bien en la pantalla */}
                            <tbody>
                                {selectedEvent.attendees.map((attendee) => (
                                    <tr key={attendee.id} className="border-b border-[#edf1f5] text-[10px] text-[#273348] last:border-0">
                                        <td className="py-3">
                                            <div>
                                                <p className="font-semibold">{attendee.nombre}</p>
                                                <p className="mt-0.5 text-[#71839c]">{attendee.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-3">{attendee.tipo}</td>
                                        <td className="py-3">{attendee.entrada}</td>
                                        <td className="py-3">
                                            <span className={`rounded-full px-2 py-1 font-semibold ${statusTone(attendee.estado)}`}>{attendee.estado}</span>
                                        </td>
                                        <td className="py-3 text-right">
                                            <button type="button" onClick={() => setEditingAttendee(attendee)} className="inline-flex items-center gap-1 rounded-[6px] border border-[#dfe7f1] px-2 py-1 text-[#172033] hover:border-[#087fea] hover:text-[#087fea]">
                                                <FiEdit3 size={11} /> Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {editingAttendee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
                    <div className="w-full max-w-md rounded-[14px] border border-[#dfe7f1] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-display text-[16px] font-bold text-[#172033]">Editar asistente</p>
                                <p className="mt-1 text-[10px] text-[#71839c]">Ajusta la información del registro seleccionado.</p>
                            </div>
                            <button type="button" onClick={() => setEditingAttendee(null)} className="text-[#68798d] hover:text-[#172033]">
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-3 text-[11px] text-[#41536c]">
                            <label className="block">
                                <span className="mb-1 block font-semibold text-[#172033]">Nombre</span>
                                <input defaultValue={editingAttendee.nombre} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]" />
                            </label>
                            <label className="block">
                                <span className="mb-1 block font-semibold text-[#172033]">Tipo de entrada</span>
                                <select defaultValue={editingAttendee.tipo} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]">
                                    <option>VIP</option>
                                    <option>Premium</option>
                                    <option>General</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block font-semibold text-[#172033]">Estado de asistencia</span>
                                <select defaultValue={editingAttendee.estado} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]">
                                    <option>Confirmado</option>
                                    <option>Pendiente</option>
                                    <option>Check-in</option>
                                </select>
                            </label>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingAttendee(null)} className="rounded-[8px] border border-[#dfe7f1] px-4 py-2 text-[10px] font-semibold text-[#667892] hover:bg-[#f5f8fb]">
                                Cancelar
                            </button>
                            <button type="button" onClick={() => setEditingAttendee(null)} className="rounded-[8px] bg-[#087fea] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#006ed8]">
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ value, label, color, icon }) {
    return (
        <div className="flex items-center gap-4 rounded-[11px] border border-[#e0e6ed] bg-white px-4 py-4">
            <span className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${color} text-[#172033]`}>{icon}</span>
            <div>
                <p className="font-display text-[20px] font-bold leading-5 text-[#172033]">{value}</p>
                <p className="mt-1 text-[10px] text-[#71839c]">{label}</p>
            </div>
        </div>
    );
}
