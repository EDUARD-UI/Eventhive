import { useMemo, useState } from 'react';
import { FiCheck, FiCreditCard, FiEdit3, FiPlus, FiX } from 'react-icons/fi';

const ticketsSeed = [
    { id: 1, name: 'General', price: '$85.000', vendidos: 180, disponibles: 120, descripcion: 'Acceso general al evento', estado: 'Activa', color: 'bg-[#d9fbe8]' },
    { id: 2, name: 'VIP', price: '$180.000', vendidos: 62, disponibles: 38, descripcion: 'Zona premium + bebida incluida', estado: 'Activa', color: 'bg-[#dfeaff]' },
    { id: 3, name: 'Estudiante', price: '$45.000', vendidos: 74, disponibles: 26, descripcion: 'Precio especial para estudiantes', estado: 'Bajo stock', color: 'bg-[#fff0d9]' },
];

export default function EntradasView() {
    const [tickets, setTickets] = useState(ticketsSeed);
    const [editingTicket, setEditingTicket] = useState(null);

    const totalVendidas = useMemo(() => tickets.reduce((sum, ticket) => sum + ticket.vendidos, 0), [tickets]);
    const totalDisponibles = useMemo(() => tickets.reduce((sum, ticket) => sum + ticket.disponibles, 0), [tickets]);
    const ingresos = useMemo(() => tickets.reduce((sum, ticket) => sum + (ticket.vendidos * Number(ticket.price.replace(/[^\d]/g, '')) / 1000), 0), [tickets]);

    return (
        <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-[18px] font-bold text-[#172033]">Entradas</h2>
                    <p className="mt-0.5 text-[13px] text-[#71839c]">Gestiona tus tipos de entrada, precios y personalización de acceso.</p>
                </div>
                <button type="button" onClick={() => setEditingTicket({ id: Date.now(), name: 'Nueva entrada', price: '$0', vendidos: 0, disponibles: 0, descripcion: 'Descripción breve', estado: 'Activa', color: 'bg-[#edf2f7]' })} className="flex items-center gap-2 rounded-[8px] bg-[#087fea] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#006ed8]">
                    <FiPlus size={14} /> Crear entrada
                </button>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard value={String(totalVendidas)} label="Vendidas" color="bg-[#d9fbe8]" icon={<FiCreditCard size={18} />} />
                <StatCard value={String(totalDisponibles)} label="Disponibles" color="bg-[#c8defd]" icon={<FiCheck size={18} />} />
                <StatCard value={`$${Math.round(ingresos)}K`} label="Ingresos" color="bg-[#dfeaff]" icon={<FiCreditCard size={18} />} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tickets.map((ticket) => (
                    <article key={ticket.id} className="rounded-[13px] border border-[#e0e6ed] bg-white p-4 shadow-[0_3px_8px_rgba(15,23,42,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-display text-[15px] font-bold text-[#172033]">{ticket.name}</p>
                                <p className="mt-1 text-[11px] text-[#71839c]">{ticket.descripcion}</p>
                            </div>
                            <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${ticket.color} text-[#172033]`}>{ticket.estado}</span>
                        </div>

                        <div className="mt-5 flex items-end justify-between gap-3">
                            <div>
                                <p className="text-[9px] uppercase text-[#71839c]">Precio</p>
                                <p className="mt-1 font-display text-[22px] font-bold text-[#172033]">{ticket.price}</p>
                            </div>
                            <button type="button" onClick={() => setEditingTicket(ticket)} className="inline-flex items-center gap-1 rounded-[7px] border border-[#dfe7f1] px-2.5 py-1.5 text-[10px] font-semibold text-[#172033] hover:border-[#087fea] hover:text-[#087fea]">
                                <FiEdit3 size={11} /> Editar
                            </button>
                        </div>

                        <div className="mt-5 space-y-2 text-[10px] text-[#596c82]">
                            <div className="flex items-center justify-between">
                                <span>Vendidas</span>
                                <strong className="text-[#172033]">{ticket.vendidos}</strong>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Disponibles</span>
                                <strong className="text-[#172033]">{ticket.disponibles}</strong>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {editingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4">
                    <div className="w-full max-w-lg rounded-[14px] border border-[#dfe7f1] bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-display text-[16px] font-bold text-[#172033]">Personalizar entrada</p>
                                <p className="mt-1 text-[10px] text-[#71839c]">Crea o ajusta la configuración de esta entrada.</p>
                            </div>
                            <button type="button" onClick={() => setEditingTicket(null)} className="text-[#68798d] hover:text-[#172033]">
                                <FiX size={16} />
                            </button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 text-[11px] text-[#41536c] md:grid-cols-2">
                            <label className="block md:col-span-2">
                                <span className="mb-1 block font-semibold text-[#172033]">Nombre</span>
                                <input defaultValue={editingTicket.name} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]" />
                            </label>
                            <label className="block">
                                <span className="mb-1 block font-semibold text-[#172033]">Precio</span>
                                <input defaultValue={editingTicket.price} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]" />
                            </label>
                            <label className="block">
                                <span className="mb-1 block font-semibold text-[#172033]">Disponibles</span>
                                <input defaultValue={editingTicket.disponibles} className="w-full rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]" />
                            </label>
                            <label className="block md:col-span-2">
                                <span className="mb-1 block font-semibold text-[#172033]">Descripción</span>
                                <textarea defaultValue={editingTicket.descripcion} className="h-[80px] w-full resize-none rounded-[7px] border border-[#dfe7f1] bg-[#f8fafc] px-3 py-2 outline-none focus:border-[#087fea]" />
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-[#41536c]">
                            <label className="flex items-center gap-2 rounded-full border border-[#dfe7f1] bg-[#f8fafc] px-3 py-1.5">
                                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#087fea]" /> QR habilitado
                            </label>
                            <label className="flex items-center gap-2 rounded-full border border-[#dfe7f1] bg-[#f8fafc] px-3 py-1.5">
                                <input type="checkbox" defaultChecked className="h-3.5 w-3.5 accent-[#087fea]" /> Validación por entrada
                            </label>
                        </div>

                        <div className="mt-5 flex justify-end gap-3">
                            <button type="button" onClick={() => setEditingTicket(null)} className="rounded-[8px] border border-[#dfe7f1] px-4 py-2 text-[10px] font-semibold text-[#667892] hover:bg-[#f5f8fb]">
                                Cancelar
                            </button>
                            <button type="button" onClick={() => {
                                if (!editingTicket.name) return;
                                setTickets((current) => {
                                    const exists = current.some((item) => item.id === editingTicket.id);
                                    if (exists) {
                                        return current.map((item) => (item.id === editingTicket.id ? { ...item, ...editingTicket } : item));
                                    }
                                    return [...current, { ...editingTicket, id: Date.now() }];
                                });
                                setEditingTicket(null);
                            }} className="rounded-[8px] bg-[#087fea] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#006ed8]">
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
